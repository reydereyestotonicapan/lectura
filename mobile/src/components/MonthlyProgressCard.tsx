import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, Radii, Spacing, createShadows } from '../theme';
import { MonthlyProgress, AwardCategory } from '../api/readings';
import ProgressBar from './ProgressBar';

const CATEGORY_META: Record<AwardCategory, { label: string; icon: string; color: string; next?: AwardCategory }> = {
  bronze: { label: 'Bronce', icon: '🥉', color: '#C77B3B', next: 'silver' },
  silver: { label: 'Plata', icon: '🥈', color: '#8E97A3', next: 'gold' },
  gold: { label: 'Oro', icon: '🥇', color: '#D4AF37' },
};

function monthLabel(month: string) {
  const [y, m] = month.split('-').map(Number);
  const name = new Date(y, (m ?? 1) - 1, 1).toLocaleDateString('es-ES', { month: 'long' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

interface Props {
  progress: MonthlyProgress;
}

/**
 * Monthly recognition card: current category badge, days answered this month
 * over the month's reading days, and how many days remain to reach the next
 * category. The category shown here matches the user's monthly recognition.
 */
export default function MonthlyProgressCard({ progress }: Props) {
  const { colors, isDark } = useTheme();
  const shadows = createShadows(isDark);

  const meta = CATEGORY_META[progress.category];
  const { days_answered, silver_threshold, gold_threshold, days_in_month } = progress;

  const nextTarget = progress.category === 'bronze' ? silver_threshold : gold_threshold;
  const remaining = Math.max(0, nextTarget - days_answered);
  const nextLabel = meta.next ? CATEGORY_META[meta.next].label : null;
  const nextIcon = meta.next ? CATEGORY_META[meta.next].icon : null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}>
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: meta.color + '22', borderColor: meta.color }]}>
          <Text style={styles.badgeIcon}>{meta.icon}</Text>
          <Text style={[styles.badgeLabel, { color: meta.color }]}>{meta.label}</Text>
        </View>
        <Text style={[styles.month, { color: colors.textMuted }]}>{monthLabel(progress.month)}</Text>
      </View>

      <ProgressBar
        progressCount={days_answered}
        totalCount={days_in_month}
        label={`${days_answered} de ${days_in_month} días respondidos`}
      />

      {progress.category === 'gold' ? (
        <Text style={[styles.hint, { color: colors.success }]}>¡Estás en la categoría máxima! 🎉</Text>
      ) : (
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {remaining === 0
            ? `¡Alcanzaste ${nextLabel}! ${nextIcon}`
            : `Te ${remaining === 1 ? 'falta' : 'faltan'} ${remaining} ${remaining === 1 ? 'día' : 'días'} para ${nextLabel} ${nextIcon}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.base,
    marginTop: 16,
    borderRadius: Radii.xl,
    padding: 16,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeIcon: {
    fontSize: 15,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  month: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  hint: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
});
