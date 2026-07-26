<?php

use App\Models\Day;
use App\Models\DayChapter;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * Seed the last assigned reading (Números 3-4 on the given date) so the command
 * auto-detects Números 5 as the continuation point.
 */
function seedLastReading(string $date = '2026-07-25'): Day
{
    $day = Day::create(['date_assigned' => $date, 'day_month' => Carbon::parse($date)->format('d/m')]);
    DayChapter::create(['day_id' => $day->id, 'book' => 'Números', 'chapter_number' => 3, 'order' => 1]);
    DayChapter::create(['day_id' => $day->id, 'book' => 'Números', 'chapter_number' => 4, 'order' => 2]);

    return $day;
}

it('fills every day from the continuation point through the end of the canon', function () {
    $past = seedLastReading();

    $this->artisan('plan:generate', ['--end-date' => '2027-06-15'])->assertSuccessful();

    // Past reading is untouched.
    expect($past->fresh()->chapters)->toBe('Números 3-4');

    // Continues at Números 5 and finishes at Apocalipsis 22.
    expect(Day::whereDate('date_assigned', '2026-07-26')->first()->chapters)->toStartWith('Números 5');
    $lastChapter = Day::whereDate('date_assigned', '2027-06-15')->first()
        ->dayChapters()->orderByDesc('order')->first();
    expect($lastChapter->book)->toBe('Apocalipsis');
    expect($lastChapter->chapter_number)->toBe(22);

    // No gaps: every date in the window has a reading.
    $start = Carbon::parse('2026-07-26');
    $end = Carbon::parse('2027-06-15');
    $expectedDays = (int) $start->diffInDays($end) + 1;
    $filled = Day::whereDate('date_assigned', '>=', $start->toDateString())
        ->whereDate('date_assigned', '<=', $end->toDateString())
        ->whereHas('dayChapters')
        ->count();
    expect($filled)->toBe($expectedDays);
});

it('splits Salmos 119 into two verse ranges at the 88-verse boundary', function () {
    seedLastReading();

    $this->artisan('plan:generate', ['--end-date' => '2027-06-15'])->assertSuccessful();

    $pieces = DayChapter::where('book', 'Salmos')->where('chapter_number', 119)
        ->orderBy('verse_start')->get();

    expect($pieces)->toHaveCount(2);
    expect($pieces[0]->verse_start)->toBe(1);
    expect($pieces[0]->verse_end)->toBe(88);
    expect($pieces[1]->verse_start)->toBe(89);
    expect($pieces[1]->verse_end)->toBe(176);
});

it('keeps the daily verse count within a consistent band', function () {
    seedLastReading();
    $verses = require database_path('data/bible_verses.php');

    $this->artisan('plan:generate', ['--end-date' => '2027-06-15'])->assertSuccessful();

    $days = Day::whereDate('date_assigned', '>=', '2026-07-26')
        ->with('dayChapters')->get();

    $counts = $days->map(function (Day $day) use ($verses) {
        return $day->dayChapters->sum(function (DayChapter $c) use ($verses) {
            if ($c->verse_start !== null) {
                return $c->verse_end - $c->verse_start + 1;
            }

            return $verses[$c->book][$c->chapter_number - 1];
        });
    });

    // Average lands on the ~84/day target; no day is wildly off.
    expect($counts->avg())->toBeGreaterThan(80)->toBeLessThan(88);
    expect($counts->min())->toBeGreaterThanOrEqual(35);
    expect($counts->max())->toBeLessThanOrEqual(125);
});

it('skips dates that already have a reading', function () {
    seedLastReading();

    // A manually-authored reading sitting in the middle of the window.
    $existing = Day::create(['date_assigned' => '2026-09-01', 'day_month' => '01/09']);
    DayChapter::create(['day_id' => $existing->id, 'book' => 'Juan', 'chapter_number' => 3, 'order' => 1]);
    $existingString = $existing->fresh()->chapters;

    $this->artisan('plan:generate', ['--end-date' => '2027-06-15'])->assertSuccessful();

    expect($existing->fresh()->chapters)->toBe($existingString);
    expect(DayChapter::where('day_id', $existing->id)->count())->toBe(1);
});

it('reports completion when the canon is already covered', function () {
    $day = Day::create(['date_assigned' => '2027-06-15', 'day_month' => '15/06']);
    DayChapter::create(['day_id' => $day->id, 'book' => 'Apocalipsis', 'chapter_number' => 22, 'order' => 1]);

    $this->artisan('plan:generate')
        ->expectsOutputToContain('Nothing to add')
        ->assertSuccessful();
});
