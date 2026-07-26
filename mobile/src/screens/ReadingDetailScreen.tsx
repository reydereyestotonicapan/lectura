import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { TodayStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { getReading } from '../api/readings';
import { Day } from '../types/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import DayReadingBody from '../components/DayReadingBody';
import { useChapterProgress } from '../hooks/useChapterProgress';
import { useUserSettings } from '../hooks/useUserSettings';
import { useAuth } from '../auth/AuthContext';
import { useReadingActions } from '../hooks/useReadingActions';

type Props = NativeStackScreenProps<TodayStackParamList, 'ReadingDetail'>;

function capitalizedDate(dateStr: string) {
  const s = new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function ReadingDetailScreen({ route, navigation }: Props) {
  const { dayId } = route.params;
  const { colors } = useTheme();

  const [day, setDay] = useState<Day | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { chapters, isLoading: isLoadingChapters, error: chapterError, toggleChapter, refreshProgress } =
    useChapterProgress(dayId);
  const { isGuest, exitGuestMode } = useAuth();
  const { settings } = useUserSettings();

  const { handleRead, handleWatch, handleToggle } = useReadingActions({
    bibleSource: settings.bible_source,
    isGuest,
    toggleChapter,
    exitGuestMode,
  });

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      try {
        const data = await getReading(dayId);
        setDay(data);
        setError(null);
        await refreshProgress();
      } catch {
        if (!silent) setError('No se pudo cargar la lectura. Verifica tu conexión.');
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [dayId, refreshProgress]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  // Silently refresh answered-state and progress when returning to this screen
  // (e.g. after answering the quiz). Skip the initial mount focus.
  const didFocus = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (didFocus.current) load(true);
      else didFocus.current = true;
    }, [load])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: day ? capitalizedDate(day.date_assigned) : 'Lectura',
    });
  }, [navigation, day]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(true);
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => load(false)} />;
  if (!day) return null;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <DayReadingBody
        day={day}
        chapters={chapters}
        isLoadingChapters={isLoadingChapters}
        chapterError={chapterError}
        onToggle={handleToggle}
        onRead={handleRead}
        onWatch={handleWatch}
        onOpenQuiz={() => navigation.navigate('Quiz', { dayId: day.id })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingBottom: 48,
  },
});
