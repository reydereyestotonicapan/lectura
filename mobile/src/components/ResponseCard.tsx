import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, Radii, createShadows, ThemeColors } from '../theme';
import { UserResponse } from '../types/api';
import AnimatedFade from './ui/AnimatedFade';

const getStatusConfig = (colors: ThemeColors) => ({
  Correcta: { color: colors.success, bg: colors.successBg, border: colors.successBorder, icon: '✓' },
  Incorrecta: { color: colors.error, bg: colors.errorBg, border: colors.errorBorder, icon: '✗' },
  Pendiente: { color: colors.warning, bg: colors.warningBg, border: colors.warningBorder, icon: '?' },
});

interface Props {
  response: UserResponse;
  index?: number;
  /** Show the day_month + chapters header (used in the mixed list, not the per-day view). */
  showDayHeader?: boolean;
}

export default function ResponseCard({ response, index = 0, showDayHeader = true }: Props) {
  const { colors, isDark } = useTheme();
  const shadows = createShadows(isDark);
  const cfg = getStatusConfig(colors)[response.status];

  return (
    <AnimatedFade delay={Math.min(index * 40, 240)}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}>
        {/* Header */}
        <View style={styles.cardTop}>
          {showDayHeader ? (
            <View style={styles.dayInfo}>
              <Text style={[styles.dayMonth, { color: colors.gold }]}>{response.day_month}</Text>
              <Text style={[styles.chapters, { color: colors.textMuted }]} numberOfLines={1}>{response.chapters}</Text>
            </View>
          ) : (
            <View style={styles.dayInfo} />
          )}
          <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            <Text style={[styles.badgeIcon, { color: cfg.color }]}>{cfg.icon}</Text>
            <Text style={[styles.badgeText, { color: cfg.color }]}>{response.status}</Text>
          </View>
        </View>

        {/* Question */}
        <Text style={[styles.question, { color: colors.textPrimary }]}>{response.question}</Text>

        {/* Answers */}
        <View style={[styles.answers, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.answerRow}>
            <Text style={[styles.answerLabel, { color: colors.textMuted }]}>Tu respuesta</Text>
            <Text
              style={[
                styles.answerValue,
                { color: colors.textSecondary },
                response.status === 'Correcta' && { color: colors.success },
                response.status === 'Incorrecta' && { color: colors.error },
              ]}
            >
              {response.your_answer || '—'}
            </Text>
          </View>

          {response.correct_answer && response.status !== 'Correcta' && (
            <View style={styles.answerRow}>
              <Text style={[styles.answerLabel, { color: colors.textMuted }]}>Correcta</Text>
              <Text style={[styles.answerValue, { color: colors.success, fontWeight: '600' }]}>
                {response.correct_answer}
              </Text>
            </View>
          )}
        </View>

        {/* Team comment */}
        {response.team_comment ? (
          <View style={[styles.teamComment, { backgroundColor: colors.primaryLight, borderColor: colors.borderMed }]}>
            <Text style={[styles.teamCommentLabel, { color: colors.primary }]}>💬 Comentario del equipo</Text>
            <Text style={[styles.teamCommentText, { color: colors.textSecondary }]}>{response.team_comment}</Text>
          </View>
        ) : null}
      </View>
    </AnimatedFade>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dayInfo: { flex: 1, marginRight: 10 },
  dayMonth: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chapters: {
    fontSize: 13,
    marginTop: 3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.full,
    borderWidth: 1,
    gap: 4,
  },
  badgeIcon: { fontSize: 11, fontWeight: '800' },
  badgeText: { fontSize: 12, fontWeight: '700' },

  question: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 12,
  },

  answers: {
    borderRadius: Radii.md,
    padding: 12,
    borderWidth: 1,
    gap: 6,
  },
  answerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 90,
    paddingTop: 1,
  },
  answerValue: {
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },

  teamComment: {
    borderRadius: Radii.md,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
  },
  teamCommentLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  teamCommentText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
