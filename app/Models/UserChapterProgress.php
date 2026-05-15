<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserChapterProgress extends Model
{
    use HasFactory;
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'day_chapter_id',
        'read_at',
    ];

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_chapter_progress';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns this progress record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the day chapter that this progress record belongs to.
     */
    public function dayChapter(): BelongsTo
    {
        return $this->belongsTo(DayChapter::class);
    }

    /**
     * Mark a chapter as read for a user.
     * Uses updateOrCreate to handle idempotency - calling multiple times
     * returns the same record without creating duplicates.
     */
    public static function markAsRead(int $userId, int $dayChapterId): self
    {
        return static::updateOrCreate(
            [
                'user_id' => $userId,
                'day_chapter_id' => $dayChapterId,
            ],
            [
                'read_at' => now(),
            ]
        );
    }

    /**
     * Mark a chapter as unread for a user.
     * Deletes the progress record if it exists.
     *
     * @return bool True if a record was deleted, false if no record existed
     */
    public static function markAsUnread(int $userId, int $dayChapterId): bool
    {
        return static::where('user_id', $userId)
            ->where('day_chapter_id', $dayChapterId)
            ->delete() > 0;
    }
}
