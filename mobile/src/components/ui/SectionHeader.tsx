import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export default function SectionHeader({ title, subtitle, action, style }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        <View style={[styles.accent, { backgroundColor: colors.gold }]} />
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {action ? <View>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accent: {
    width: 3,
    height: 22,
    borderRadius: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
});
