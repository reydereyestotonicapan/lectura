import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import client from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useTheme, Radii, Spacing, createShadows } from '../theme';
import { ApiUser } from '../types/api';
import { AccountStackParamList } from '../navigation/types';
import LoadingState from '../components/LoadingState';
import AnimatedFade from '../components/ui/AnimatedFade';

type Props = NativeStackScreenProps<AccountStackParamList, 'Profile'>;

function initials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function MenuItem({ icon, label, onPress, destructive, colors }: { icon: string; label: string; onPress: () => void; destructive?: boolean; colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.menuIcon, { backgroundColor: destructive ? colors.errorBg : colors.background }]}>
        <Text style={styles.menuEmoji}>{icon}</Text>
      </View>
      <Text style={[styles.menuLabel, { color: destructive ? colors.error : colors.textPrimary }]}>{label}</Text>
      <Text style={[styles.menuArrow, { color: colors.textDisabled }]}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }: Props) {
  const { signOut, user, setUser } = useAuth();
  const { colors, gradients, isDark } = useTheme();
  const shadows = createShadows(isDark);
  const [isLoading, setIsLoading] = useState(!user);

  useEffect(() => {
    if (user) return;
    client.get('/profile').then(({ data }) => {
      setUser(data as ApiUser);
    }).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState />;

  const dynamicStyles = createDynamicStyles(colors, shadows);

  return (
    <ScrollView style={dynamicStyles.root} showsVerticalScrollIndicator={false}>
      {/* Avatar hero */}
      <AnimatedFade>
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.avatarRing}>
            <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(user?.name)}</Text>
            </LinearGradient>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.version}>gRafé v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
        </LinearGradient>
      </AnimatedFade>

      {/* Menu */}
      <AnimatedFade delay={100} style={styles.menuSection}>
        <Text style={[styles.menuTitle, { color: colors.textMuted }]}>Cuenta</Text>
        <View style={[dynamicStyles.menuCard]}>
          <MenuItem
            icon="⚙️"
            label="Configuración"
            onPress={() => navigation.navigate('Settings')}
            colors={colors}
          />
          <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
          <MenuItem
            icon="🚪"
            label="Cerrar sesión"
            onPress={signOut}
            destructive
            colors={colors}
          />
        </View>
      </AnimatedFade>

      {/* App info */}
      <AnimatedFade delay={180} style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textDisabled }]}>Iglesia de Dios Pentecostés del Rey de Reyes</Text>
        <Text style={[styles.footerVerse, { color: colors.textDisabled }]}>"Tu palabra es lámpara a mis pies" — Salmo 119:105</Text>
      </AnimatedFade>
    </ScrollView>
  );
}

const createDynamicStyles = (colors: ReturnType<typeof useTheme>['colors'], shadows: ReturnType<typeof createShadows>) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    menuCard: {
      backgroundColor: colors.surface,
      borderRadius: Radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...shadows.sm,
    },
  });

const styles = StyleSheet.create({
  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: Spacing.xl,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 50,
    backgroundColor: 'rgba(255,252,240,0.3)',
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFCF0',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,252,240,0.7)',
  },
  version: {
    fontSize: 12,
    color: 'rgba(255,252,240,0.5)',
    marginTop: 8,
  },

  // Menu
  menuSection: {
    marginHorizontal: Spacing.base,
    marginTop: 28,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuEmoji: { fontSize: 18 },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
    fontWeight: '300',
  },
  menuDivider: {
    height: 1,
    marginLeft: 66,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 32,
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 6,
  },
  footerVerse: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
