import React, { useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Radii, createShadows } from '../../theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export default function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  size = 'md',
  style,
}: Props) {
  const { colors, gradients, isDark } = useTheme();
  const shadows = createShadows(isDark);
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();

  const paddingVertical = size === 'lg' ? 18 : size === 'sm' ? 12 : 16;
  const fontSize = size === 'sm' ? 14 : 16;

  if (variant === 'outline') {
    return (
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <TouchableOpacity
          style={[styles.outline, { paddingVertical, borderColor: colors.primary }, disabled && styles.dimmed]}
          onPress={onPress}
          disabled={disabled || loading}
          onPressIn={pressIn}
          onPressOut={pressOut}
          activeOpacity={1}
        >
          <Text style={[styles.outlineText, { fontSize, color: colors.primary }]}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'ghost') {
    return (
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <TouchableOpacity
          style={[styles.ghost, { paddingVertical }, disabled && styles.dimmed]}
          onPress={onPress}
          disabled={disabled || loading}
          onPressIn={pressIn}
          onPressOut={pressOut}
          activeOpacity={1}
        >
          <Text style={[styles.ghostText, { fontSize, color: colors.textMuted }]}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[shadows.gold, { transform: [{ scale }] }, disabled && styles.dimmed, style]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        style={{ borderRadius: Radii.lg, overflow: 'hidden' }}
      >
        <LinearGradient
          colors={disabled ? [colors.textDisabled, colors.borderMed] : gradients.gold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { paddingVertical }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.primaryText, { fontSize }]}>{label}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingHorizontal: 24,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  outline: {
    paddingHorizontal: 24,
    borderRadius: Radii.lg,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  outlineText: {
    fontWeight: '600',
  },
  ghost: {
    paddingHorizontal: 24,
    borderRadius: Radii.lg,
    alignItems: 'center',
  },
  ghostText: {
    fontWeight: '500',
  },
  dimmed: {
    opacity: 0.55,
  },
});
