<?php

use App\Models\Day;
use App\Models\DayChapter;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function chapterRow(string $book, int $number, ?string $link = null): DayChapter
{
    static $order = 0;
    $day = Day::query()->first() ?? Day::create([
        'date_assigned' => '2026-08-01',
        'day_month' => '01/08',
    ]);

    return DayChapter::create([
        'day_id' => $day->id,
        'book' => $book,
        'chapter_number' => $number,
        'order' => ++$order,
        'youtube_link' => $link,
    ]);
}

it('fills youtube_link for covered chapters and leaves uncovered ones empty', function () {
    $covered = chapterRow('Números', 5);        // channel has this
    $uncovered = chapterRow('Génesis', 1);      // channel has no Génesis
    $existing = chapterRow('Números', 6, 'https://youtu.be/manual');

    $this->artisan('plan:youtube')->assertSuccessful();

    expect($covered->fresh()->youtube_link)->toBe('https://youtu.be/vDoPfqGoijI');
    expect($uncovered->fresh()->youtube_link)->toBeNull();
    // Fill-empty policy leaves a manually-set link untouched.
    expect($existing->fresh()->youtube_link)->toBe('https://youtu.be/manual');
});

it('replaces existing links when --overwrite is passed', function () {
    $existing = chapterRow('Números', 25, 'https://youtu.be/manual');

    $this->artisan('plan:youtube', ['--overwrite' => true])->assertSuccessful();

    // Números 25 is the video the plan was seeded from.
    expect($existing->fresh()->youtube_link)->toBe('https://youtu.be/jNbcbBIItAo');
});
