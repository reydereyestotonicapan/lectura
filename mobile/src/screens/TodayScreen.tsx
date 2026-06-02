import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { TodayStackParamList } from '../navigation/types';
import { useTheme, Radii, Spacing, createShadows } from '../theme';
import { getToday } from '../api/readings';
import { Day } from '../types/api';
import { ChapterWithProgress } from '../types/chapter';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ChapterListItem from '../components/ChapterListItem';
import ProgressBar from '../components/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import AnimatedFade from '../components/ui/AnimatedFade';
import { useChapterProgress } from '../hooks/useChapterProgress';
import { useUserSettings } from '../hooks/useUserSettings';
import { useAuth } from '../auth/AuthContext';
import { openChapter } from '../services/deepLink';

type Props = NativeStackScreenProps<TodayStackParamList, 'Today'>;

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function TodayScreen({ navigation }: Props) {
  const { colors, gradients, isDark } = useTheme();
  const shadows = createShadows(isDark);
  const [day, setDay] = useState<Day | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const { chapters, isLoading: isLoadingChapters, error: chapterError, toggleChapter } =
    useChapterProgress(day?.id ?? null);
  const { isGuest, exitGuestMode } = useAuth();
  const { settings, refreshSettings } = useUserSettings();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={headerStyles.titleWrap}>
          <Image 
            source={require('../../assets/app-icon.png')} 
            style={headerStyles.icon}
            resizeMode="contain"
          />
          <Text style={[headerStyles.title, { color: colors.textPrimary }]}>gRafé</Text>
        </View>
      ),
      headerRight: isGuest
        ? () => (
            <TouchableOpacity onPress={exitGuestMode} style={headerStyles.btn}>
              <Text style={[headerStyles.btnText, { color: colors.primary }]}>Iniciar sesión</Text>
            </TouchableOpacity>
          )
        : () => (
            <TouchableOpacity onPress={() => navigation.navigate('ReadingsList')} style={headerStyles.btn}>
              <Text style={[headerStyles.btnText, { color: colors.primary }]}>Lecturas</Text>
            </TouchableOpacity>
          ),
    });
  }, [navigation, isGuest, exitGuestMode, colors]);

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

  const handleReadChapter = useCallback(
    async (chapter: ChapterWithProgress) => {
      try {
        await openChapter(chapter.book, chapter.chapter_number, settings.bible_source);
        if (!chapter.is_read && !isGuest) toggleChapter(chapter.id);
      } catch {
        Alert.alert('Error', 'No se pudo abrir el capítulo. Intenta de nuevo.');
      }
    },
    [settings.bible_source, toggleChapter, isGuest]
  );

  const handleWatchChapter = useCallback(
    (chapter: ChapterWithProgress) => {
      if (chapter.youtube_link) Linking.openURL(chapter.youtube_link);
      if (!chapter.is_read && !isGuest) toggleChapter(chapter.id);
    },
    [toggleChapter, isGuest]
  );

  const handleToggleChapter = useCallback(
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
    [toggleChapter, isGuest, exitGuestMode]
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (notFound) return (
    <EmptyState
      icon="🌅"
      message="Sin lectura para hoy"
      detail="Vuelve mañana para continuar tu plan de lectura."
    />
  );
  if (!day) return null;

  const readCount = chapters.filter((c) => c.is_read).length;
  const totalChapters = chapters.length;
  const totalQuestions = day.questions?.length ?? 0;
  const alreadyAnswered = (day.answered_count ?? 0) >= totalQuestions && totalQuestions > 0;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Date hero */}
      <AnimatedFade delay={0}>
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <Text style={styles.heroDate}>{formatDate(day.date_assigned)}</Text>
          {day.day_month ? <Text style={styles.heroLabel}>{day.day_month}</Text> : null}
        </LinearGradient>
      </AnimatedFade>

      {/* Reading progress */}
      {!isLoadingChapters && totalChapters > 0 && (
        <AnimatedFade delay={80}>
          <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}>
            <ProgressBar progressCount={readCount} totalCount={totalChapters} />
          </View>
        </AnimatedFade>
      )}

      {/* Chapters */}
      <AnimatedFade delay={160} style={styles.chaptersWrap}>
        <SectionHeader
          title="Capítulos de hoy"
          subtitle={
            chapterError
              ? 'Error al cargar'
              : isLoadingChapters
              ? 'Cargando...'
              : `${totalChapters} ${totalChapters === 1 ? 'capítulo' : 'capítulos'}`
          }
          style={styles.sectionHeader}
        />

        {isLoadingChapters ? (
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Cargando capítulos...</Text>
        ) : chapterError ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{chapterError}</Text>
        ) : (
          chapters.map((chapter) => (
            <ChapterListItem
              key={chapter.id}
              chapter={chapter}
              onToggle={handleToggleChapter}
              onRead={handleReadChapter}
              onWatch={handleWatchChapter}
            />
          ))
        )}
      </AnimatedFade>

      {/* Quiz CTA */}
      <AnimatedFade delay={240} style={styles.ctaWrap}>
        {alreadyAnswered ? (
          <View style={[styles.completedCard, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
            <Text style={styles.completedIcon}>🎉</Text>
            <View>
              <Text style={[styles.completedTitle, { color: colors.success }]}>¡Preguntas completadas!</Text>
              <Text style={[styles.completedSub, { color: colors.success }]}>Vuelve mañana con una nueva lectura.</Text>
            </View>
          </View>
        ) : totalQuestions > 0 ? (
          <TouchableOpacity
            style={[styles.quizCta, shadows.gold]}
            onPress={() => navigation.navigate('Quiz', { dayId: day.id })}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={gradients.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.quizCtaGradient}
            >
              <Text style={styles.quizCtaText}>Responder preguntas</Text>
              <Text style={styles.quizCtaCount}>{totalQuestions} preguntas  →</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : null}
      </AnimatedFade>
    </ScrollView>
  );
}

const headerStyles = StyleSheet.create({
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  btn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  btnText: {
    fontWeight: '600',
    fontSize: 15,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingBottom: 48,
  },

  // Hero date strip
  hero: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingTop: 28,
    paddingBottom: 28,
  },
  heroDate: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFCF0',
    textTransform: 'capitalize',
    letterSpacing: -0.3,
  },
  heroLabel: {
    fontSize: 13,
    color: 'rgba(255,252,240,0.7)',
    marginTop: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Progress card
  progressCard: {
    marginHorizontal: Spacing.base,
    marginTop: 16,
    borderRadius: Radii.xl,
    padding: 16,
    borderWidth: 1,
  },

  // Chapters section
  chaptersWrap: {
    marginHorizontal: Spacing.base,
    marginTop: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },

  // CTA
  ctaWrap: {
    marginHorizontal: Spacing.base,
    marginTop: 24,
  },
  quizCta: {
    borderRadius: Radii.xl,
    overflow: 'hidden',
  },
  quizCtaGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizCtaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  quizCtaCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderRadius: Radii.xl,
    padding: 18,
  },
  completedIcon: {
    fontSize: 28,
  },
  completedTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  completedSub: {
    fontSize: 13,
    opacity: 0.75,
    marginTop: 2,
  },
});
