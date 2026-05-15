import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TodayStackParamList } from '../navigation/types';
import { Colors } from '../theme';
import { getToday } from '../api/readings';
import { Day } from '../types/api';
import { ChapterWithProgress } from '../types/chapter';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ChapterListItem from '../components/ChapterListItem';
import ProgressBar from '../components/ProgressBar';
import { useChapterProgress } from '../hooks/useChapterProgress';
import { useUserSettings } from '../hooks/useUserSettings';
import { openChapter } from '../services/deepLink';

type Props = NativeStackScreenProps<TodayStackParamList, 'Today'>;

export default function TodayScreen({ navigation }: Props) {
  const [day, setDay] = useState<Day | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Chapter progress hook - only active when day is loaded
  const {
    chapters,
    isLoading: isLoadingChapters,
    error: chapterError,
    toggleChapter,
    progressCount,
    totalCount,
  } = useChapterProgress(day?.id ?? null);

  // User settings hook for Bible source preference
  const { settings } = useUserSettings();

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await getToday();
      setDay(data);
    } catch (err: any) {
      if (err.response?.status === 404) setNotFound(true);
      else setError('No se pudo cargar la lectura. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Handle opening a chapter in external Bible source
  const handleReadChapter = useCallback(
    async (chapter: ChapterWithProgress) => {
      await openChapter(chapter.book, chapter.chapter_number, settings.bible_source);
    },
    [settings.bible_source]
  );

  // Handle toggling chapter read status
  const handleToggleChapter = useCallback(
    (chapterId: number) => {
      toggleChapter(chapterId);
    },
    [toggleChapter]
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (notFound) return <EmptyState message="No hay lectura disponible para hoy." />;
  if (!day) return null;

  const totalQuestions = day.questions?.length ?? 0;
  const alreadyAnswered = (day.answered_count ?? 0) >= totalQuestions && totalQuestions > 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.dayMonth}>{day.day_month}</Text>
      <Text style={styles.date}>
        {new Date(day.date_assigned + 'T00:00:00').toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
      <View style={styles.card}>
        <Text style={styles.label}>Lectura</Text>
        <Text style={styles.chapters}>{day.chapters}</Text>
      </View>

      {/* Progress Bar */}
      <ProgressBar progressCount={progressCount} totalCount={totalCount} />

      {/* Chapter List */}
      {isLoadingChapters ? (
        <Text style={styles.loadingText}>Cargando capítulos...</Text>
      ) : chapterError ? (
        <Text style={styles.errorText}>{chapterError}</Text>
      ) : (
        <View style={styles.chapterList}>
          {chapters.map((chapter) => (
            <ChapterListItem
              key={chapter.id}
              chapter={chapter}
              onToggle={handleToggleChapter}
              onRead={handleReadChapter}
            />
          ))}
        </View>
      )}

      {/* Quiz Button or Completed Badge */}
      {alreadyAnswered ? (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>Quiz completado</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Quiz', { dayId: day.id })}
        >
          <Text style={styles.buttonText}>Comenzar Quiz</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  dayMonth: { fontSize: 13, fontWeight: '600', color: Colors.primary, textTransform: 'uppercase', marginBottom: 4 },
  date: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20, textTransform: 'capitalize' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  label: { fontSize: 12, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 },
  chapters: { fontSize: 18, color: '#1f2937', fontWeight: '500' },
  chapterList: {
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  completedBadge: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  completedText: { color: '#15803d', fontWeight: '600', fontSize: 15 },
});
