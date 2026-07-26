import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, Radii, Spacing, createShadows } from '../theme';
import { MonthlyProgress } from '../api/readings';
import ProgressBar from './ProgressBar';

function monthLabel(month: string) {
  const [y, m] = month.split('-').map(Number);
  const name = new Date(y, (m ?? 1) - 1, 1).toLocaleDateString('es-ES', { month: 'long' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

interface Props {
  progress: MonthlyProgress;
}

/**
 * Monthly progress card: how many days the user has answered this month, with a
 * bar that fills as they answer more. Resets each month.
 */
export default function MonthlyProgressCard({ progress }: Props) {
  const { colors, isDark } = useTheme();
  const shadows = createShadows(isDark);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}>
      <Text style={[styles.title, { color: colors.textMuted }]}>Días respondidos · {monthLabel(progress.month)}</Text>
      <ProgressBar
        progressCount={progress.days_answered}
        totalCount={progress.days_in_month}
        label={`${progress.days_answered} de ${progress.days_in_month} días`}
      />
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
  title: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
});
