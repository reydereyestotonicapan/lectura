import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme';

interface ProgressBarProps {
  progressCount: number;
  totalCount: number;
}

export default function ProgressBar({ progressCount, totalCount }: ProgressBarProps) {
  const progress = totalCount > 0 ? progressCount / totalCount : 0;
  const percentage = Math.min(Math.max(progress, 0), 1) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.text}>
        {progressCount}/{totalCount} capítulos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  barContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  text: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
