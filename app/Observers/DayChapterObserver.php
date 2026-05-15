<?php

namespace App\Observers;

use App\Models\Day;
use App\Models\DayChapter;

class DayChapterObserver
{
    /**
     * Handle the DayChapter "created" event.
     */
    public function created(DayChapter $dayChapter): void
    {
        $this->syncChaptersString($dayChapter);
    }

    /**
     * Handle the DayChapter "updated" event.
     */
    public function updated(DayChapter $dayChapter): void
    {
        $this->syncChaptersString($dayChapter);
    }

    /**
     * Handle the DayChapter "deleted" event.
     */
    public function deleted(DayChapter $dayChapter): void
    {
        $this->syncChaptersString($dayChapter);
    }

    /**
     * Handle the DayChapter "restored" event.
     */
    public function restored(DayChapter $dayChapter): void
    {
        $this->syncChaptersString($dayChapter);
    }

    /**
     * Handle the DayChapter "force deleted" event.
     */
    public function forceDeleted(DayChapter $dayChapter): void
    {
        $this->syncChaptersString($dayChapter);
    }

    /**
     * Regenerate the days.chapters display string from structured chapter data.
     *
     * Algorithm:
     * 1. Get all chapters for the day ordered by 'order' field
     * 2. Group consecutive chapters by book
     * 3. For each group:
     *    - If start == end: format as "Book Chapter"
     *    - If start != end: format as "Book Start-End"
     * 4. Join all groups with ", "
     *
     * Examples:
     * - Consecutive: "Romanos 8-10"
     * - Non-consecutive: "Romanos 8, Mateo 1-2"
     * - Mixed: "Romanos 8-10, Mateo 1, Lucas 3-5"
     */
    protected function syncChaptersString(DayChapter $dayChapter): void
    {
        $day = $dayChapter->day;

        // If the day relationship is not loaded (e.g., during delete), try to load it
        if (! $day) {
            $day = Day::find($dayChapter->day_id);
        }

        if (! $day) {
            return;
        }

        // Get all chapters for this day ordered by 'order' field
        $chapters = DayChapter::where('day_id', $day->id)
            ->orderBy('order')
            ->get();

        // If no chapters, set empty string
        if ($chapters->isEmpty()) {
            $day->chapters = '';
            $day->saveQuietly();

            return;
        }

        // Group consecutive chapters by book
        $groups = [];
        $currentGroup = null;

        foreach ($chapters as $chapter) {
            if ($currentGroup === null) {
                // Start first group
                $currentGroup = [
                    'book' => $chapter->book,
                    'start' => $chapter->chapter_number,
                    'end' => $chapter->chapter_number,
                ];
            } elseif (
                $chapter->book === $currentGroup['book'] &&
                $chapter->chapter_number === $currentGroup['end'] + 1
            ) {
                // Extend current group (consecutive chapter in same book)
                $currentGroup['end'] = $chapter->chapter_number;
            } else {
                // Save current group and start new one
                $groups[] = $currentGroup;
                $currentGroup = [
                    'book' => $chapter->book,
                    'start' => $chapter->chapter_number,
                    'end' => $chapter->chapter_number,
                ];
            }
        }

        // Don't forget to add the last group
        if ($currentGroup !== null) {
            $groups[] = $currentGroup;
        }

        // Format groups into string parts
        $parts = [];
        foreach ($groups as $group) {
            if ($group['start'] === $group['end']) {
                // Single chapter: "Book Chapter"
                $parts[] = "{$group['book']} {$group['start']}";
            } else {
                // Range: "Book Start-End"
                $parts[] = "{$group['book']} {$group['start']}-{$group['end']}";
            }
        }

        // Join all parts with ", "
        $chaptersString = implode(', ', $parts);

        // Update the day's chapters string
        $day->chapters = $chaptersString;
        $day->saveQuietly();
    }
}
