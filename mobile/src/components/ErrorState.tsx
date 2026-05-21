import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, Radii, createShadows } from '../theme';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Ocurrió un error.', onRetry }: Props) {
  const { colors, isDark } = useTheme();
  const shadows = createShadows(isDark);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.errorBg }]}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }, shadows.sm]} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      )}
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
  icon: { fontSize: 30 },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: Radii.lg,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
