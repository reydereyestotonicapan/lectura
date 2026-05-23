import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KidsStackParamList } from '../navigation/types';
import { useTheme, Radii, Spacing, createShadows } from '../theme';
import { getKidsReading, getKidsReadingDownloadUrl } from '../api/kidsReadings';
import { KidsReading } from '../types/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import AnimatedFade from '../components/ui/AnimatedFade';

type Props = NativeStackScreenProps<KidsStackParamList, 'KidsReadingDetail'>;

export default function KidsReadingDetailScreen({ route }: Props) {
  const { id } = route.params;
  const { colors, gradients, isDark } = useTheme();
  const shadows = createShadows(isDark);

  const [reading, setReading] = useState<KidsReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getKidsReading(id);
      setReading(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Lectura no encontrada.');
      } else {
        setError('No se pudo cargar la lectura. Verifica tu conexión.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownloadPdf = async () => {
    if (!reading) return;

    setIsDownloading(true);
    try {
      const url = await getKidsReadingDownloadUrl(reading.id);
      await Linking.openURL(url);
    } catch (err: any) {
      if (err.response?.status === 404) {
        Alert.alert('Error', 'El archivo PDF no está disponible.');
      } else {
        Alert.alert('Error', 'No se pudo descargar el PDF. Inténtalo de nuevo.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!reading) return null;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with week label */}
      <AnimatedFade delay={0}>
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroWeek}>{reading.week_label}</Text>
          {reading.is_current && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Semana actual</Text>
            </View>
          )}
        </LinearGradient>
      </AnimatedFade>

      {/* Title and passage */}
      <AnimatedFade delay={80} style={styles.mainContent}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{reading.title}</Text>
          <View style={[styles.passageWrap, { backgroundColor: colors.goldFaint }]}>
            <Text style={[styles.passageLabel, { color: colors.goldDark }]}>📖 Pasaje</Text>
            <Text style={[styles.passage, { color: colors.gold }]}>{reading.passage}</Text>
          </View>

          {reading.description && (
            <View style={styles.descriptionWrap}>
              <Text style={[styles.descriptionLabel, { color: colors.textMuted }]}>Descripción</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {reading.description}
              </Text>
            </View>
          )}
        </View>
      </AnimatedFade>

      {/* PDF Download button */}
      {reading.has_pdf && (
        <AnimatedFade delay={160} style={styles.downloadWrap}>
          <TouchableOpacity
            style={[styles.downloadBtn, shadows.gold]}
            onPress={handleDownloadPdf}
            disabled={isDownloading}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={isDownloading ? [colors.textDisabled, colors.borderMed] : gradients.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.downloadGradient}
            >
              <Text style={styles.downloadIcon}>📄</Text>
              <Text style={styles.downloadText}>
                {isDownloading ? 'Abriendo...' : 'Descargar PDF'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={[styles.downloadHint, { color: colors.textMuted }]}>
            Actividades para completar con tus hijos
          </Text>
        </AnimatedFade>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingBottom: 48,
  },

  // Hero header
  hero: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingTop: 28,
    paddingBottom: 28,
  },
  heroWeek: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFCF0',
    letterSpacing: -0.3,
  },
  currentBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFCF0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Main content card
  mainContent: {
    marginHorizontal: Spacing.base,
    marginTop: -12,
  },
  card: {
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  passageWrap: {
    padding: 16,
    borderRadius: Radii.lg,
    marginBottom: 16,
  },
  passageLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  passage: {
    fontSize: 18,
    fontWeight: '700',
  },
  descriptionWrap: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },

  // Download button
  downloadWrap: {
    marginHorizontal: Spacing.base,
    marginTop: 24,
    alignItems: 'center',
  },
  downloadBtn: {
    borderRadius: Radii.xl,
    overflow: 'hidden',
    width: '100%',
  },
  downloadGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  downloadIcon: {
    fontSize: 20,
  },
  downloadText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  downloadHint: {
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});
