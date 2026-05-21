<?php

namespace Database\Seeders;

use App\Models\Day;
use App\Models\DayChapter;
use Illuminate\Database\Seeder;

class DayChaptersSeeder extends Seeder
{
    /**
     * Seed the day_chapters table by parsing existing days.chapters strings.
     *
     * This seeder parses the chapters string (e.g., "Génesis 1-2, Éxodo 3")
     * and creates individual DayChapter records for each chapter.
     */
    public function run(): void
    {
        $days = Day::whereNotNull('chapters')
            ->where('chapters', '!=', '')
            ->get();

        foreach ($days as $day) {
            // Skip if day already has chapters
            if ($day->dayChapters()->exists()) {
                $this->command->info("Day {$day->id} ({$day->day_month}) already has chapters, skipping.");
                continue;
            }

            $chapters = $this->parseChaptersString($day->chapters);
            $order = 1;

            foreach ($chapters as $chapter) {
                DayChapter::create([
                    'day_id' => $day->id,
                    'book' => $chapter['book'],
                    'chapter_number' => $chapter['chapter_number'],
                    'order' => $order++,
                ]);
            }

            $this->command->info("Created " . count($chapters) . " chapters for Day {$day->id} ({$day->day_month}): {$day->chapters}");
        }
    }

    /**
     * Parse a chapters string into individual chapter records.
     *
     * Examples:
     * - "Génesis 1-2" → [['book' => 'Génesis', 'chapter_number' => 1], ['book' => 'Génesis', 'chapter_number' => 2]]
     * - "Romanos 8" → [['book' => 'Romanos', 'chapter_number' => 8]]
     * - "Génesis 1-2, Éxodo 3" → [['book' => 'Génesis', 'chapter_number' => 1], ['book' => 'Génesis', 'chapter_number' => 2], ['book' => 'Éxodo', 'chapter_number' => 3]]
     *
     * @param string $chaptersString
     * @return array<array{book: string, chapter_number: int}>
     */
    protected function parseChaptersString(string $chaptersString): array
    {
        $chapters = [];
        
        // Split by comma to get individual book references
        $parts = array_map('trim', explode(',', $chaptersString));

        foreach ($parts as $part) {
            // Match pattern: "Book Name Chapter" or "Book Name Start-End"
            // Examples: "Génesis 1", "Génesis 1-2", "1 Samuel 3-5"
            if (preg_match('/^(.+?)\s+(\d+)(?:-(\d+))?$/', $part, $matches)) {
                $book = trim($matches[1]);
                $start = (int) $matches[2];
                $end = isset($matches[3]) ? (int) $matches[3] : $start;

                for ($i = $start; $i <= $end; $i++) {
                    $chapters[] = [
                        'book' => $book,
                        'chapter_number' => $i,
                    ];
                }
            }
        }

        return $chapters;
    }
}
