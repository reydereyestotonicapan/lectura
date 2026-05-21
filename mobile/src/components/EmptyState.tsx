import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  message: string;
  icon?: string;
  detail?: string;
}

export default function EmptyState({ message, icon = '📖', detail }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.goldFaint }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.message, { color: colors.textPrimary }]}>{message}</Text>
      {detail ? <Text style={[styles.detail, { color: colors.textMuted }]}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 32,
  },
  message: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
});
