<?php

namespace App\Console\Commands;

use App\Models\DayChapter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ApplyYoutubeLinks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'plan:youtube
        {--target= : Which database to write to: local | stage | prod. Omit to use the app default connection.}
        {--overwrite : Replace existing youtube_link values (default: only fill empty ones).}
        {--dry-run : Report coverage without writing anything.}
        {--force : Skip the confirmation prompt when writing to a remote database.}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate day_chapters.youtube_link from the TLA Video Biblia YouTube catalog.';

    private const TARGETS = [
        'local' => 'pgsql_local',
        'stage' => 'pgsql_stage',
        'prod' => 'pgsql_prod',
    ];

    public function handle(): int
    {
        if (! $this->selectTargetConnection()) {
            return self::FAILURE;
        }

        /** @var array<string, array<int,string>> $videos book => [chapter => url] */
        $videos = require database_path('data/youtube_videos.php');

        $overwrite = (bool) $this->option('overwrite');

        // Match against the reading plan: every chapter row that has a video.
        $chapters = DayChapter::query()
            ->orderBy('book')
            ->orderBy('chapter_number')
            ->get(['id', 'book', 'chapter_number', 'youtube_link']);

        $updates = [];   // id => url
        $matched = 0;
        $skippedExisting = 0;
        $noVideo = 0;
        $perBook = [];   // book => [set, skipped]

        foreach ($chapters as $chapter) {
            $url = $videos[$chapter->book][$chapter->chapter_number] ?? null;

            if ($url === null) {
                $noVideo++;

                continue;
            }

            $matched++;

            if (! $overwrite && ! empty($chapter->youtube_link)) {
                $skippedExisting++;
                $perBook[$chapter->book]['skipped'] = ($perBook[$chapter->book]['skipped'] ?? 0) + 1;

                continue;
            }

            if ($chapter->youtube_link === $url) {
                // Already correct — nothing to do.
                continue;
            }

            $updates[$chapter->id] = $url;
            $perBook[$chapter->book]['set'] = ($perBook[$chapter->book]['set'] ?? 0) + 1;
        }

        $this->reportCoverage($perBook, $matched, count($updates), $skippedExisting, $noVideo, $chapters->count());

        if (empty($updates)) {
            $this->newLine();
            $this->info('Nothing to update.');

            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $this->newLine();
            $this->warn('Dry run — no changes written. Re-run without --dry-run to persist.');

            return self::SUCCESS;
        }

        DB::transaction(function () use ($updates) {
            foreach ($updates as $id => $url) {
                DayChapter::whereKey($id)->update(['youtube_link' => $url]);
            }
        });

        $this->newLine();
        $this->info(sprintf('Done. Set youtube_link on %d chapters.', count($updates)));

        return self::SUCCESS;
    }

    /**
     * Resolve the --target option to a Postgres connection, make it the default
     * connection for this run, and confirm before writing to a remote database.
     */
    private function selectTargetConnection(): bool
    {
        $target = strtolower((string) $this->option('target'));

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

        config(['database.default' => $connection]);
        DB::setDefaultConnection($connection);

        $this->line(sprintf('<fg=cyan>Target:</> %s (%s)%s',
            strtoupper($target),
            $connection,
            $this->option('dry-run') ? ' — dry run' : ''
        ));

        $remote = in_array($target, ['stage', 'prod'], true);
        if (! $this->option('dry-run') && $remote && ! $this->option('force')) {
            $label = $target === 'prod' ? '<fg=red;options=bold>PRODUCTION</>' : 'STAGE';
            if (! $this->confirm("This will set YouTube links on {$label}. Continue?", false)) {
                $this->warn('Aborted.');

                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<string, array{set?:int, skipped?:int}>  $perBook
     */
    private function reportCoverage(array $perBook, int $matched, int $toSet, int $skippedExisting, int $noVideo, int $total): void
    {
        $this->info(sprintf(
            '%d chapter rows · %d have a video · %d to set · %d kept (existing link) · %d have no video',
            $total,
            $matched,
            $toSet,
            $skippedExisting,
            $noVideo
        ));

        if (empty($perBook)) {
            return;
        }

        $this->newLine();
        ksort($perBook);
        foreach ($perBook as $book => $counts) {
            $parts = [];
            if (! empty($counts['set'])) {
                $parts[] = "{$counts['set']} to set";
            }
            if (! empty($counts['skipped'])) {
                $parts[] = "{$counts['skipped']} kept";
            }
            $this->line(sprintf('  %-16s %s', $book, implode(', ', $parts)));
        }
    }
}
