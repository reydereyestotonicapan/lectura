import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  progressCount: number;
  totalCount: number;
  label?: string;
}

export default function ProgressBar({ progressCount, totalCount, label }: Props) {
  const { colors } = useTheme();
  const pct = totalCount > 0 ? Math.min(progressCount / totalCount, 1) : 0;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label ?? `${progressCount} de ${totalCount} capítulos`}</Text>
        <Text style={[styles.pct, { color: colors.gold }]}>{Math.round(pct * 100)}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.fill, { width, backgroundColor: colors.gold }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: { fontSize: 13 },
  pct: { fontSize: 13, fontWeight: '600' },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
