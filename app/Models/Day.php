<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Day extends Model
{
    use HasFactory;

    protected $fillable = [
        'date_assigned',
        'chapters',
        'day_month',
    ];

    protected $casts = [
        'date_assigned' => 'date',
    ];

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    /**
     * Get the chapters assigned to this day.
     */
    public function dayChapters(): HasMany
    {
        return $this->hasMany(DayChapter::class);
    }

    /**
     * Get chapters with progress status for a specific user.
     *
     * Returns all chapters for this day ordered by the 'order' field,
     * with each chapter's read status and read_at timestamp for the given user.
     */
    public function getProgressForUser(int $userId): Collection
    {
        return $this->dayChapters()
            ->orderBy('order')
            ->get()
            ->map(function (DayChapter $chapter) use ($userId) {
                $progress = $chapter->userProgress()
                    ->where('user_id', $userId)
                    ->first();

                return (object) [
                    'id' => $chapter->id,
                    'day_id' => $chapter->day_id,
                    'book' => $chapter->book,
                    'chapter_number' => $chapter->chapter_number,
                    'order' => $chapter->order,
                    'display_name' => $chapter->display_name,
                    'youversion_reference' => $chapter->youversion_reference,
                    'biblegateway_url' => $chapter->biblegateway_url,
                    'is_read' => $progress !== null,
                    'read_at' => $progress?->read_at,
                ];
            });
    }
}
