import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { TodayStackParamList } from '../navigation/types';
import { Colors } from '../theme';
import { getToday } from '../api/readings';
import { Day } from '../types/api';
import { ChapterWithProgress } from '../types/chapter';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ChapterListItem from '../components/ChapterListItem';
import { useChapterProgress } from '../hooks/useChapterProgress';
import { useUserSettings } from '../hooks/useUserSettings';
import { useAuth } from '../auth/AuthContext';
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
  } = useChapterProgress(day?.id ?? null);

  const { isGuest, exitGuestMode } = useAuth();

  useLayoutEffect(() => {
    if (isGuest) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={exitGuestMode} style={{ marginRight: 16 }}>
            <Text style={{ color: Colors.primary, fontWeight: '600' }}>Iniciar sesión</Text>
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('ReadingsList')} style={{ marginRight: 16 }}>
            <Text style={{ color: Colors.primary, fontWeight: '600' }}>Lecturas</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, isGuest, exitGuestMode]);

  // User settings hook for Bible source preference
  const { settings, refreshSettings } = useUserSettings();

  useFocusEffect(
    useCallback(() => {
      refreshSettings();
    }, [refreshSettings])
  );

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

  // Handle opening a chapter in external Bible source, auto-marking as read
  const handleReadChapter = useCallback(
    async (chapter: ChapterWithProgress) => {
      await openChapter(chapter.book, chapter.chapter_number, settings.bible_source);
      if (!chapter.is_read && !isGuest) {
        toggleChapter(chapter.id);
      }
    },
    [settings.bible_source, toggleChapter, isGuest]
  );

  // Handle opening YouTube link, auto-marking as read
  const handleWatchChapter = useCallback(
    (chapter: ChapterWithProgress) => {
      if (chapter.youtube_link) {
        Linking.openURL(chapter.youtube_link);
      }
      if (!chapter.is_read && !isGuest) {
        toggleChapter(chapter.id);
      }
    },
    [toggleChapter, isGuest]
  );

  // Handle toggling chapter read status
  const handleToggleChapter = useCallback(
    (chapterId: number) => {
      if (isGuest) {
        Alert.alert(
          'Inicia sesión',
          'Registra tu progreso de lectura creando una cuenta.',
          [
            { text: 'Ahora no', style: 'cancel' },
            { text: 'Iniciar sesión', onPress: exitGuestMode },
          ]
        );
        return;
      }
      toggleChapter(chapterId);
    },
    [toggleChapter, isGuest, exitGuestMode]
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (notFound) return <EmptyState message="No hay lectura disponible para hoy." />;
  if (!day) return null;

  const totalQuestions = day.questions?.length ?? 0;
  const alreadyAnswered = (day.answered_count ?? 0) >= totalQuestions && totalQuestions > 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.date}>
        {new Date(day.date_assigned + 'T00:00:00').toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>

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
              onWatch={handleWatchChapter}
            />
          ))}
        </View>
      )}

      {alreadyAnswered ? (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>Preguntas completadas</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Quiz', { dayId: day.id })}
        >
          <Text style={styles.buttonText}>Responder preguntas</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  date: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20, textTransform: 'capitalize' },
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
