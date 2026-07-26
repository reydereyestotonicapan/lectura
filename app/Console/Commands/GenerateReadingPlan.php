<?php

namespace App\Console\Commands;

use App\Models\Day;
use App\Models\DayChapter;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateReadingPlan extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'plan:generate
        {--target= : Which database to write to: local | stage | prod. Omit to use the app default connection.}
        {--start-date= : First date to fill (Y-m-d). Defaults to the day after the last assigned reading.}
        {--end-date=2027-06-15 : Last date of the plan (Y-m-d).}
        {--start-book= : Book to continue from (Spanish). Defaults to the chapter after the last assigned reading.}
        {--start-chapter= : Chapter to continue from. Required if --start-book is given.}
        {--dry-run : Print the schedule without writing anything.}
        {--force : Skip the confirmation prompt when writing to a remote database.}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fill the daily Bible reading plan with verse-balanced portions in canonical order.';

    /**
     * Split any chapter longer than this multiple of the daily target into
     * contiguous verse ranges spread across consecutive days.
     */
    private const OVERSIZE_FACTOR = 1.4;

    /**
     * Set during auto-detection when the last assigned reading is already the
     * final chapter of the canon (Apocalipsis 22) — the plan is complete.
     */
    private bool $planComplete = false;

    /**
     * Map a --target value to its database connection name.
     */
    private const TARGETS = [
        'local' => 'pgsql_local',
        'stage' => 'pgsql_stage',
        'prod' => 'pgsql_prod',
    ];

    public function handle(): int
    {
        // ---- Point every query in this run at the chosen database --------------
        if (! $this->selectTargetConnection()) {
            return self::FAILURE;
        }

        /** @var array<string, array<int,int>> $verses book => [chapter1Verses, chapter2Verses, ...] */
        $verses = require database_path('data/bible_verses.php');
        $books = array_keys($verses);

        // ---- Resolve where reading continues from -------------------------------
        [$startBook, $startChapter] = $this->resolveStartPosition($books);
        if ($this->planComplete) {
            $this->info('The plan already runs through the end of the canon (Apocalipsis 22). Nothing to add.');

            return self::SUCCESS;
        }
        if ($startBook === null) {
            $this->error('Could not determine a start position. Pass --start-book and --start-chapter, '
                .'or make sure at least one past day already has chapters.');

            return self::FAILURE;
        }

        // ---- Resolve the date window to fill ------------------------------------
        $endDate = Carbon::parse($this->option('end-date'))->startOfDay();
        $startDate = $this->resolveStartDate($endDate);
        if ($startDate === null) {
            return self::FAILURE;
        }
        if ($startDate->gt($endDate)) {
            $this->error("Start date {$startDate->toDateString()} is after end date {$endDate->toDateString()}.");

            return self::FAILURE;
        }

        // ---- Build the ordered chapter queue: start position -> Apocalipsis 22 --
        $chapters = $this->buildChapterQueue($verses, $books, $startBook, $startChapter);
        if (empty($chapters)) {
            $this->error("No chapters remain after {$startBook} {$startChapter}.");

            return self::FAILURE;
        }

        // ---- Determine the empty dates to fill (skip occupied days) -------------
        $targetDates = $this->emptyDatesInRange($startDate, $endDate);
        $dayCount = count($targetDates);
        if ($dayCount === 0) {
            $this->info('No empty dates in range — nothing to fill. The plan already covers this window.');

            return self::SUCCESS;
        }

        $totalVerses = array_sum(array_column($chapters, 'verses'));
        $target = $totalVerses / $dayCount;

        // ---- Split oversized chapters into verse-range units -------------------
        $units = [];
        foreach ($chapters as $chapter) {
            foreach ($this->splitChapter($chapter, $target) as $unit) {
                $units[] = $unit;
            }
        }

        if (count($units) < $dayCount) {
            $this->error(sprintf(
                'Only %d reading units remain but %d days need filling — the window is too long for the '
                .'remaining scripture. Shorten --end-date or adjust the start position.',
                count($units),
                $dayCount
            ));

            return self::FAILURE;
        }

        // ---- Pack units into days, balanced by cumulative verse target ---------
        $schedule = $this->packUnits($units, $targetDates, $target);

        $this->printSummary($schedule, $startBook, $startChapter, $totalVerses, $target);

        if ($this->option('dry-run')) {
            $this->newLine();
            $this->warn('Dry run — no changes written. Re-run without --dry-run to persist.');

            return self::SUCCESS;
        }

        $this->persist($schedule);

        $this->newLine();
        $this->info(sprintf('Done. Created %d days (%s → %s).',
            count($schedule),
            $schedule[0]['date']->toDateString(),
            end($schedule)['date']->toDateString(),
        ));

        return self::SUCCESS;
    }

    /**
     * Resolve the --target option to a Postgres connection, make it the default
     * connection for this run, and confirm before writing to a remote database.
     */
    private function selectTargetConnection(): bool
    {
        $target = strtolower((string) $this->option('target'));

        // No explicit target: run against the app's current default connection.
        if ($target === '') {
            $this->line(sprintf('<fg=cyan>Target:</> %s (app default connection)%s',
                config('database.default'),
                $this->option('dry-run') ? ' — dry run' : ''
            ));

            return true;
        }

        if (! isset(self::TARGETS[$target])) {
            $this->error("Unknown --target '{$target}'. Use one of: ".implode(', ', array_keys(self::TARGETS)).'.');

            return false;
        }

        $connection = self::TARGETS[$target];
        $envVar = strtoupper($target).'_DB_URL';

        if (! config("database.connections.{$connection}.url")) {
            $this->error("{$envVar} is not set in your .env file (needed for --target={$target}).");

            return false;
        }

        // Route all Eloquent models and DB::transaction() at this connection.
        config(['database.default' => $connection]);
        DB::setDefaultConnection($connection);

        $writing = ! $this->option('dry-run');
        $remote = in_array($target, ['stage', 'prod'], true);

        $this->line(sprintf(
            '<fg=cyan>Target:</> %s (%s)%s',
            strtoupper($target),
            $connection,
            $this->option('dry-run') ? ' — dry run' : ''
        ));

        if ($writing && $remote && ! $this->option('force')) {
            $label = $target === 'prod' ? '<fg=red;options=bold>PRODUCTION</>' : 'STAGE';
            if (! $this->confirm("This will write reading-plan days to {$label}. Continue?", false)) {
                $this->warn('Aborted.');

                return false;
            }
        }

        return true;
    }

    /**
     * Resolve the (book, chapter) to continue reading from.
     *
     * @param  array<int,string>  $books
     * @return array{0: ?string, 1: int}
     */
    private function resolveStartPosition(array $books): array
    {
        $optBook = $this->option('start-book');
        $optChapter = $this->option('start-chapter');

        if ($optBook !== null && $optChapter !== null) {
            if (! in_array($optBook, $books, true)) {
                $this->error("Unknown book '{$optBook}'.");

                return [null, 0];
            }

            return [$optBook, (int) $optChapter];
        }

        // Auto-detect: the chapter after the last assigned reading (latest date
        // that has chapters, then its highest-ordered chapter).
        $lastDay = Day::whereHas('dayChapters')
            ->orderByDesc('date_assigned')
            ->first();

        if ($lastDay === null) {
            return [null, 0];
        }

        $lastChapter = $lastDay->dayChapters()->orderByDesc('order')->first();
        if ($lastChapter === null) {
            return [null, 0];
        }

        $next = $this->nextChapter($books, $lastChapter->book, $lastChapter->chapter_number);
        if ($next[0] === null) {
            // The last assigned reading is the final chapter of the canon.
            $this->planComplete = true;
        }

        return $next;
    }

    /**
     * Resolve the first date to fill.
     */
    private function resolveStartDate(Carbon $endDate): ?Carbon
    {
        if ($this->option('start-date')) {
            return Carbon::parse($this->option('start-date'))->startOfDay();
        }

        $lastDay = Day::whereHas('dayChapters')
            ->orderByDesc('date_assigned')
            ->first();

        if ($lastDay === null) {
            $this->error('No existing days found. Pass --start-date to set the first date to fill.');

            return null;
        }

        return $lastDay->date_assigned->copy()->addDay()->startOfDay();
    }

    /**
     * Return the chapter immediately following the given (book, chapter).
     *
     * @param  array<int,string>  $books
     * @return array{0: ?string, 1: int}
     */
    private function nextChapter(array $books, string $book, int $chapter): array
    {
        $verses = require database_path('data/bible_verses.php');
        $chapterCount = count($verses[$book] ?? []);

        if ($chapter < $chapterCount) {
            return [$book, $chapter + 1];
        }

        // Move to the first chapter of the next book.
        $idx = array_search($book, $books, true);
        if ($idx === false || $idx + 1 >= count($books)) {
            return [null, 0];
        }

        return [$books[$idx + 1], 1];
    }

    /**
     * Build the ordered list of chapters from the start position through the
     * final chapter of the canon (Apocalipsis 22).
     *
     * @param  array<string, array<int,int>>  $verses
     * @param  array<int,string>  $books
     * @return array<int, array{book:string, chapter:int, verses:int}>
     */
    private function buildChapterQueue(array $verses, array $books, string $startBook, int $startChapter): array
    {
        $queue = [];
        $started = false;

        foreach ($books as $book) {
            if ($book === $startBook) {
                $started = true;
            }
            if (! $started) {
                continue;
            }

            $first = ($book === $startBook) ? $startChapter : 1;
            $count = count($verses[$book]);

            for ($ch = $first; $ch <= $count; $ch++) {
                $queue[] = [
                    'book' => $book,
                    'chapter' => $ch,
                    'verses' => $verses[$book][$ch - 1],
                ];
            }
        }

        return $queue;
    }

    /**
     * All dates in [start, end] that have no occupied Day (a Day with chapters).
     *
     * @return array<int, Carbon>
     */
    private function emptyDatesInRange(Carbon $start, Carbon $end): array
    {
        $occupied = Day::whereDate('date_assigned', '>=', $start->toDateString())
            ->whereDate('date_assigned', '<=', $end->toDateString())
            ->where(function ($q) {
                $q->whereHas('dayChapters')
                    ->orWhere(fn ($q) => $q->whereNotNull('chapters')->where('chapters', '!=', ''));
            })
            ->pluck('date_assigned')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->flip();

        $dates = [];
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            if (! $occupied->has($d->toDateString())) {
                $dates[] = $d->copy();
            }
        }

        return $dates;
    }

    /**
     * Split a chapter into one or more reading units. Whole chapters keep
     * verse_start/verse_end null; only chapters longer than OVERSIZE_FACTOR *
     * target are broken into contiguous verse ranges of roughly target verses.
     *
     * @param  array{book:string, chapter:int, verses:int}  $chapter
     * @return array<int, array{book:string, chapter:int, verse_start:?int, verse_end:?int, verses:int}>
     */
    private function splitChapter(array $chapter, float $target): array
    {
        $count = $chapter['verses'];

        if ($count <= self::OVERSIZE_FACTOR * $target) {
            return [[
                'book' => $chapter['book'],
                'chapter' => $chapter['chapter'],
                'verse_start' => null,
                'verse_end' => null,
                'verses' => $count,
            ]];
        }

        $pieces = max(2, (int) round($count / $target));
        $base = (int) ceil($count / $pieces);

        // Bias Psalm 119 to its 8-verse acrostic stanza boundaries.
        if ($chapter['book'] === 'Salmos' && $chapter['chapter'] === 119) {
            $base = (int) (ceil($base / 8) * 8);
        }

        $units = [];
        $start = 1;
        while ($start <= $count) {
            $end = min($count, $start + $base - 1);
            $units[] = [
                'book' => $chapter['book'],
                'chapter' => $chapter['chapter'],
                'verse_start' => $start,
                'verse_end' => $end,
                'verses' => $end - $start + 1,
            ];
            $start = $end + 1;
        }

        return $units;
    }

    /**
     * Partition the ordered units into one contiguous group per target date,
     * minimizing the total squared deviation of each day's verse count from the
     * daily target. This keeps days as evenly sized as whole-chapter reading
     * allows. Every day gets at least one unit and all units are consumed.
     *
     * Solved with a banded dynamic program: dp[d][k] = min cost to place the
     * first k units into d days; each day holds between 1 and $maxPerDay units.
     *
     * @param  array<int, array{book:string, chapter:int, verse_start:?int, verse_end:?int, verses:int}>  $units
     * @param  array<int, Carbon>  $dates
     * @return array<int, array{date: Carbon, units: array<int,array>, verses: int}>
     */
    private function packUnits(array $units, array $dates, float $target): array
    {
        $unitCount = count($units);
        $dayCount = count($dates);

        // Prefix sums of verse counts: prefix[k] = verses in the first k units.
        $prefix = [0];
        foreach ($units as $u) {
            $prefix[] = end($prefix) + $u['verses'];
        }

        // Max units a single day may hold — generous headroom over the average
        // so the DP always has a feasible partition.
        $maxPerDay = max(8, (int) ceil(($unitCount / $dayCount) * 3));
        while ($dayCount * $maxPerDay < $unitCount) {
            $maxPerDay++;
        }

        $inf = INF;
        // Rolling DP rows keep memory to O(units); pick[] retains choices for
        // backtracking the boundaries.
        $prev = array_fill(0, $unitCount + 1, $inf);
        $prev[0] = 0.0;
        $pick = [];

        for ($d = 1; $d <= $dayCount; $d++) {
            $cur = array_fill(0, $unitCount + 1, $inf);
            $pickRow = array_fill(0, $unitCount + 1, -1);

            $kMin = $d;                          // at least one unit per day so far
            $kMax = $unitCount - ($dayCount - $d); // leave one per remaining day
            for ($k = $kMin; $k <= $kMax; $k++) {
                $best = $inf;
                $bestJ = -1;
                for ($j = 1; $j <= $maxPerDay; $j++) {
                    $pk = $k - $j;
                    if ($pk < $d - 1) {
                        break;
                    }
                    if ($prev[$pk] === $inf) {
                        continue;
                    }
                    $sum = $prefix[$k] - $prefix[$pk];
                    $cost = $prev[$pk] + ($sum - $target) ** 2;
                    if ($cost < $best) {
                        $best = $cost;
                        $bestJ = $j;
                    }
                }
                $cur[$k] = $best;
                $pickRow[$k] = $bestJ;
            }

            $pick[$d] = $pickRow;
            $prev = $cur;
        }

        // Backtrack boundaries: bounds[i] = units consumed after day i.
        $bounds = array_fill(0, $dayCount + 1, 0);
        $bounds[$dayCount] = $unitCount;
        $k = $unitCount;
        for ($d = $dayCount; $d >= 1; $d--) {
            $j = $pick[$d][$k];
            $bounds[$d - 1] = $k - $j;
            $k -= $j;
        }

        $schedule = [];
        for ($i = 0; $i < $dayCount; $i++) {
            $slice = array_slice($units, $bounds[$i], $bounds[$i + 1] - $bounds[$i]);
            $schedule[] = [
                'date' => $dates[$i],
                'units' => $slice,
                'verses' => array_sum(array_column($slice, 'verses')),
            ];
        }

        return $schedule;
    }

    /**
     * @param  array<int, array{date: Carbon, units: array<int,array>, verses: int}>  $schedule
     */
    private function persist(array $schedule): void
    {
        DB::transaction(function () use ($schedule) {
            foreach ($schedule as $entry) {
                /** @var Carbon $date */
                $date = $entry['date'];

                $day = Day::firstOrNew(['date_assigned' => $date->toDateString()]);
                $day->day_month = $date->format('d/m');
                $day->save();

                $order = 1;
                foreach ($entry['units'] as $unit) {
                    DayChapter::create([
                        'day_id' => $day->id,
                        'book' => $unit['book'],
                        'chapter_number' => $unit['chapter'],
                        'verse_start' => $unit['verse_start'],
                        'verse_end' => $unit['verse_end'],
                        'order' => $order++,
                    ]);
                }
            }
        });
    }

    /**
     * @param  array<int, array{date: Carbon, units: array<int,array>, verses: int}>  $schedule
     */
    private function printSummary(array $schedule, string $startBook, int $startChapter, int $totalVerses, float $target): void
    {
        $dayVerses = array_column($schedule, 'verses');

        $this->info(sprintf('Plan: %s %d → Apocalipsis 22', $startBook, $startChapter));
        $this->line(sprintf(
            '  %d days · %s → %s · %d verses · target %.1f/day (min %d, max %d)',
            count($schedule),
            $schedule[0]['date']->toDateString(),
            end($schedule)['date']->toDateString(),
            $totalVerses,
            $target,
            min($dayVerses),
            max($dayVerses),
        ));
        $this->newLine();

        foreach ($schedule as $entry) {
            $reading = implode(', ', array_map(fn ($u) => $this->unitLabel($u), $entry['units']));
            $this->line(sprintf('  %s  %-45s %3d v', $entry['date']->toDateString(), $reading, $entry['verses']));
        }
    }

    /**
     * @param  array{book:string, chapter:int, verse_start:?int, verse_end:?int, verses:int}  $unit
     */
    private function unitLabel(array $unit): string
    {
        $label = "{$unit['book']} {$unit['chapter']}";
        if ($unit['verse_start'] !== null) {
            $label .= ':'.$unit['verse_start'];
            if ($unit['verse_end'] !== null && $unit['verse_end'] !== $unit['verse_start']) {
                $label .= '-'.$unit['verse_end'];
            }
        }

        return $label;
    }
}
