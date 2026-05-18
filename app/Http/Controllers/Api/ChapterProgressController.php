<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Day;
use App\Models\DayChapter;
use App\Models\UserChapterProgress;
use Illuminate\Http\JsonResponse;

class ChapterProgressController extends Controller
{
    /**
     * Get all chapters with progress for a day.
     *
     * Returns all chapters for the specified day ordered by the 'order' field,
     * with each chapter's read status and read_at timestamp for the authenticated user.
     *
     * Response format:
     * {
     *   "data": {
     *     "id": 1,
     *     "date_assigned": "2025-01-15",
     *     "chapters": "Romanos 8-10",
     *     "day_chapters": [...],
     *     "progress_count": 2,
     *     "total_chapters": 3
     *   }
     * }
     *
     * @param  Day  $day  The day to get chapters for (route model binding)
     * @return JsonResponse
     *
     * Requirements: 3.5, 3.6, 8.1
     */
    public function show(Day $day): JsonResponse
    {
        $user = auth('sanctum')->user();
        $chapters = $user
            ? $day->getProgressForUser($user->id)
            : $day->dayChapters()->orderBy('order')->get()->map(fn ($chapter) => (object) [
                'id'                   => $chapter->id,
                'day_id'               => $chapter->day_id,
                'book'                 => $chapter->book,
                'chapter_number'       => $chapter->chapter_number,
                'order'                => $chapter->order,
                'display_name'         => $chapter->display_name,
                'youversion_reference' => $chapter->youversion_reference,
                'biblegateway_url'     => $chapter->biblegateway_url,
                'youtube_link'         => $chapter->youtube_link,
                'is_read'              => false,
                'read_at'              => null,
            ]);

        $progressCount = $chapters->filter(fn ($chapter) => $chapter->is_read)->count();
        $totalChapters = $chapters->count();

        return response()->json([
            'data' => [
                'id' => $day->id,
                'date_assigned' => $day->date_assigned->toDateString(),
                'chapters' => $day->chapters,
                'day_chapters' => $chapters,
                'progress_count' => $progressCount,
                'total_chapters' => $totalChapters,
            ],
        ]);
    }

    /**
     * Mark a chapter as read for the authenticated user.
     *
     * Creates a UserChapterProgress record if one doesn't exist,
     * or returns the existing record (idempotent operation).
     *
     * Response format:
     * {
     *   "data": {
     *     "id": 1,
     *     "day_chapter_id": 5,
     *     "read_at": "2025-01-15T10:30:00+00:00"
     *   }
     * }
     *
     * @param  DayChapter  $chapter  The chapter to mark as read (route model binding)
     * @return JsonResponse 201 if newly created, 200 if already existed
     *
     * Requirements: 3.1, 3.3, 8.2
     */
    public function markRead(DayChapter $chapter): JsonResponse
    {
        $user = auth()->user();

        // Check if progress already exists to determine response status code
        $existingProgress = UserChapterProgress::where('user_id', $user->id)
            ->where('day_chapter_id', $chapter->id)
            ->first();

        $progress = UserChapterProgress::markAsRead($user->id, $chapter->id);

        // Return 201 if newly created, 200 if already existed
        $statusCode = $existingProgress ? 200 : 201;

        return response()->json([
            'data' => [
                'id' => $progress->id,
                'day_chapter_id' => $progress->day_chapter_id,
                'read_at' => $progress->read_at->toIso8601String(),
            ],
        ], $statusCode);
    }

    /**
     * Mark a chapter as unread for the authenticated user.
     *
     * Deletes the UserChapterProgress record if it exists.
     *
     * Response format:
     * {
     *   "success": true
     * }
     *
     * @param  DayChapter  $chapter  The chapter to mark as unread (route model binding)
     * @return JsonResponse
     *
     * Requirements: 3.2, 8.3
     */
    public function markUnread(DayChapter $chapter): JsonResponse
    {
        $user = auth()->user();

        $deleted = UserChapterProgress::markAsUnread($user->id, $chapter->id);

        return response()->json([
            'success' => $deleted,
        ]);
    }
}
