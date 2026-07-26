<?php

use App\Models\Day;
use App\Models\DayChapter;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('builds whole-chapter links when no verse range is set', function () {
    $chapter = new DayChapter(['book' => 'Números', 'chapter_number' => 5]);

    expect($chapter->display_name)->toBe('Números 5');
    expect($chapter->youversion_reference)->toBe('youversion://bible?reference=NUM.5&version=176');
    expect($chapter->biblegateway_url)
        ->toBe('https://www.biblegateway.com/passage/?search=N%C3%BAmeros%205&version=TLA');
});

it('builds verse-range links matching the YouVersion and BibleGateway formats', function () {
    $chapter = new DayChapter([
        'book' => 'Salmos',
        'chapter_number' => 119,
        'verse_start' => 1,
        'verse_end' => 80,
    ]);

    expect($chapter->display_name)->toBe('Salmos 119:1-80');
    expect($chapter->youversion_reference)->toBe('youversion://bible?reference=PSA.119.1-80&version=176');
    expect($chapter->biblegateway_url)
        ->toBe('https://www.biblegateway.com/passage/?search=Salmos%20119%3A1-80&version=TLA');
});

it('builds single-verse links when start equals end', function () {
    $chapter = new DayChapter([
        'book' => 'Salmos',
        'chapter_number' => 119,
        'verse_start' => 5,
        'verse_end' => 5,
    ]);

    expect($chapter->display_name)->toBe('Salmos 119:5');
    expect($chapter->youversion_reference)->toBe('youversion://bible?reference=PSA.119.5&version=176');
    expect($chapter->biblegateway_url)
        ->toBe('https://www.biblegateway.com/passage/?search=Salmos%20119%3A5&version=TLA');
});

it('renders versed chapters as standalone tokens in the day string', function () {
    $day = Day::create(['date_assigned' => '2026-12-17', 'day_month' => '17/12']);

    DayChapter::create(['day_id' => $day->id, 'book' => 'Salmos', 'chapter_number' => 119, 'verse_start' => 1, 'verse_end' => 80, 'order' => 1]);
    DayChapter::create(['day_id' => $day->id, 'book' => 'Salmos', 'chapter_number' => 120, 'order' => 2]);
    DayChapter::create(['day_id' => $day->id, 'book' => 'Salmos', 'chapter_number' => 121, 'order' => 3]);

    expect($day->fresh()->chapters)->toBe('Salmos 119:1-80, Salmos 120-121');
});

it('still groups consecutive whole chapters into a range', function () {
    $day = Day::create(['date_assigned' => '2026-07-26', 'day_month' => '26/07']);

    DayChapter::create(['day_id' => $day->id, 'book' => 'Números', 'chapter_number' => 5, 'order' => 1]);
    DayChapter::create(['day_id' => $day->id, 'book' => 'Números', 'chapter_number' => 6, 'order' => 2]);

    expect($day->fresh()->chapters)->toBe('Números 5-6');
});
