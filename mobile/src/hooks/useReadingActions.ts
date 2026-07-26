import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { ChapterWithProgress, BibleSource } from '../types/chapter';
import { openChapter } from '../services/deepLink';

interface UseReadingActionsParams {
  bibleSource: BibleSource;
  isGuest: boolean;
  toggleChapter: (chapterId: number) => void;
  exitGuestMode: () => void;
}

/**
 * Shared chapter actions (open reading, watch video, toggle read progress) used
 * by both the Today screen and the day-detail screen so past/future days behave
 * exactly like the current day.
 */
export function useReadingActions({
  bibleSource,
  isGuest,
  toggleChapter,
  exitGuestMode,
}: UseReadingActionsParams) {
  const handleRead = useCallback(
    async (chapter: ChapterWithProgress) => {
      try {
        await openChapter(
          chapter.book,
          chapter.chapter_number,
          bibleSource,
          chapter.verse_start,
          chapter.verse_end
        );
        if (!chapter.is_read && !isGuest) toggleChapter(chapter.id);
      } catch {
        Alert.alert('Error', 'No se pudo abrir el capítulo. Intenta de nuevo.');
      }
    },
    [bibleSource, toggleChapter, isGuest]
  );

  const handleWatch = useCallback(
    (chapter: ChapterWithProgress) => {
      if (chapter.youtube_link) Linking.openURL(chapter.youtube_link);
      if (!chapter.is_read && !isGuest) toggleChapter(chapter.id);
    },
    [toggleChapter, isGuest]
  );

  const handleToggle = useCallback(
    (chapterId: number) => {
      if (isGuest) {
        Alert.alert('Inicia sesión', 'Registra tu progreso de lectura creando una cuenta.', [
          { text: 'Ahora no', style: 'cancel' },
          { text: 'Iniciar sesión', onPress: exitGuestMode },
        ]);
        return;
      }
      toggleChapter(chapterId);
    },
    [isGuest, exitGuestMode, toggleChapter]
  );

  return { handleRead, handleWatch, handleToggle };
}

export default useReadingActions;
