import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Radii, Spacing, createShadows } from '../theme';
import { Day } from '../types/api';
import { MonthlyProgress } from '../api/readings';
import { ChapterWithProgress } from '../types/chapter';
import ChapterListItem from './ChapterListItem';
import MonthlyProgressCard from './MonthlyProgressCard';
import SectionHeader from './ui/SectionHeader';
import AnimatedFade from './ui/AnimatedFade';

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

interface Props {
  day: Day;
  chapters: ChapterWithProgress[];
  isLoadingChapters: boolean;
  chapterError: string | null;
  /** This month's recognition progress (days answered + current category). */
  monthlyProgress?: MonthlyProgress | null;
  /** When true the copy is phrased for the current day ("Capítulos de hoy"). */
  isToday?: boolean;
  onToggle: (chapterId: number) => void;
  onRead: (chapter: ChapterWithProgress) => void;
  onWatch: (chapter: ChapterWithProgress) => void;
  onOpenQuiz: () => void;
}

/**
 * The reading body shared by the Today screen and the day-detail screen: date
 * hero, reading-progress bar, chapter list (with Leer/▶/toggle), and the quiz
 * CTA. Rendered inside each screen's own scroll container.
 */
export default function DayReadingBody({
  day,
  chapters,
  isLoadingChapters,
  chapterError,
  monthlyProgress,
  isToday = false,
  onToggle,
  onRead,
  onWatch,
  onOpenQuiz,
}: Props) {
  const { colors, gradients, isDark } = useTheme();
  const shadows = createShadows(isDark);

  const totalChapters = chapters.length;
  const totalQuestions = day.questions?.length ?? day.questions_count ?? 0;
  const alreadyAnswered = (day.answered_count ?? 0) >= totalQuestions && totalQuestions > 0;

  return (
    <>
      {/* Date hero */}
      <AnimatedFade delay={0}>
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <Text style={styles.heroDate}>{formatDate(day.date_assigned)}</Text>
          {day.day_month ? <Text style={styles.heroLabel}>{day.day_month}</Text> : null}
        </LinearGradient>
      </AnimatedFade>

      {/* Monthly recognition progress (days answered this month + category) */}
      {monthlyProgress && (
        <AnimatedFade delay={80}>
          <MonthlyProgressCard progress={monthlyProgress} />
        </AnimatedFade>
      )}

      {/* Chapters */}
      <AnimatedFade delay={160} style={styles.chaptersWrap}>
        <SectionHeader
          title={isToday ? 'Capítulos de hoy' : 'Capítulos'}
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
              onToggle={onToggle}
              onRead={onRead}
              onWatch={onWatch}
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
              <Text style={[styles.completedSub, { color: colors.success }]}>
                {isToday ? 'Vuelve mañana con una nueva lectura.' : 'Ya respondiste las preguntas de este día.'}
              </Text>
            </View>
          </View>
        ) : totalQuestions > 0 ? (
          <TouchableOpacity style={[styles.quizCta, shadows.gold]} onPress={onOpenQuiz} activeOpacity={0.88}>
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
    </>
  );
}

const styles = StyleSheet.create({
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
