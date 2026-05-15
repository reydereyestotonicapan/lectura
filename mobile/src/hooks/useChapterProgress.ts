import { useState, useCallback, useEffect } from 'react';
import { ChapterWithProgress } from '../types/chapter';
import {
  getChaptersWithProgress,
  markChapterRead,
  markChapterUnread,
} from '../api/chapters';

/**
 * Return type for the useChapterProgress hook
 */
export interface UseChapterProgressReturn {
  chapters: ChapterWithProgress[];
  isLoading: boolean;
  error: string | null;
  toggleChapter: (chapterId: number) => Promise<void>;
  refreshProgress: () => Promise<void>;
  progressCount: number;
  totalCount: number;
}

/**
 * Custom hook for managing chapter reading progress with optimistic UI updates.
 * 
 * Features:
 * - Fetches chapters with progress for a given day
 * - Optimistic UI updates when toggling chapter read status
 * - Automatic rollback on API errors
 * - Progress count calculation
 * 
 * @param dayId - The ID of the day to fetch chapters for
 * @returns UseChapterProgressReturn with chapters, loading state, error, and actions
 * 
 * **Validates: Requirements 6.5, 6.6, 6.7, 11.2, 11.3**
 */
export function useChapterProgress(dayId: number | null): UseChapterProgressReturn {
  const [chapters, setChapters] = useState<ChapterWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches chapters with progress from the API
   */
  const refreshProgress = useCallback(async () => {
    if (dayId === null) {
      setChapters([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dayWithChapters = await getChaptersWithProgress(dayId);
      setChapters(dayWithChapters.day_chapters);
    } catch (err) {
      setError('No se pudo cargar el progreso. Intenta de nuevo.');
      console.error('Error fetching chapter progress:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dayId]);

  /**
   * Toggles the read status of a chapter with optimistic UI update.
   * If the API call fails, the state is rolled back and an error is shown.
   * 
   * @param chapterId - The ID of the chapter to toggle
   * 
   * **Validates: Requirements 6.5, 6.6, 11.2, 11.3**
   */
  const toggleChapter = useCallback(async (chapterId: number) => {
    // Find the chapter to toggle
    const chapterIndex = chapters.findIndex((ch) => ch.id === chapterId);
    if (chapterIndex === -1) {
      return;
    }

    const chapter = chapters[chapterIndex];
    const wasRead = chapter.is_read;

    // Store previous state for rollback
    const previousChapters = [...chapters];

    // Optimistic update: immediately toggle is_read in state
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              is_read: !wasRead,
              read_at: !wasRead ? new Date().toISOString() : null,
            }
          : ch
      )
    );

    // Clear any previous error
    setError(null);

    try {
      if (wasRead) {
        // Chapter was read, mark as unread
        await markChapterUnread(chapterId);
      } else {
        // Chapter was unread, mark as read
        await markChapterRead(chapterId);
      }
    } catch (err) {
      // Rollback to previous state on error
      setChapters(previousChapters);
      setError('No se pudo guardar el progreso. Intenta de nuevo.');
      console.error('Error toggling chapter progress:', err);
    }
  }, [chapters]);

  // Calculate progress counts
  const progressCount = chapters.filter((ch) => ch.is_read).length;
  const totalCount = chapters.length;

  // Fetch chapters when dayId changes
  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  return {
    chapters,
    isLoading,
    error,
    toggleChapter,
    refreshProgress,
    progressCount,
    totalCount,
  };
}

export default useChapterProgress;
