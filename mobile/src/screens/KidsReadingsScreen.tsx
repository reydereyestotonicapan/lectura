import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KidsStackParamList } from '../navigation/types';
import { useTheme, Radii, Spacing, createShadows, ThemeColors } from '../theme';
import { KidsReading } from '../types/api';
import { getKidsReadings, getCurrentKidsReading } from '../api/kidsReadings';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import AnimatedFade from '../components/ui/AnimatedFade';
import SectionHeader from '../components/ui/SectionHeader';

type Props = NativeStackScreenProps<KidsStackParamList, 'KidsReadings'>;

interface ReadingCardProps {
  reading: KidsReading;
  index: number;
  colors: ThemeColors;
  shadows: ReturnType<typeof createShadows>;
  onPress: () => void;
}

function ReadingCard({ reading, index, colors, shadows, onPress }: ReadingCardProps) {
  return (
    <AnimatedFade delay={Math.min(index * 40, 240)}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.weekLabel, { color: colors.gold }]}>{reading.week_label}</Text>
          {reading.has_pdf && (
            <View style={[styles.pdfBadge, { backgroundColor: colors.primaryLight, borderColor: colors.borderMed }]}>
              <Text style={[styles.pdfBadgeText, { color: colors.primary }]}>📄 PDF</Text>
            </View>
          )}
        </View>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
          {reading.title}
        </Text>
        <Text style={[styles.cardPassage, { color: colors.textMuted }]} numberOfLines={1}>
          {reading.passage}
        </Text>
      </TouchableOpacity>
    </AnimatedFade>
  );
}

interface CurrentReadingCardProps {
  reading: KidsReading;
  colors: ThemeColors;
  shadows: ReturnType<typeof createShadows>;
  gradients: { hero: [string, string] };
  onPress: () => void;
}

function CurrentReadingCard({ reading, colors, shadows, gradients, onPress }: CurrentReadingCardProps) {
  return (
    <AnimatedFade delay={0}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.currentCard, shadows.md]}
        >
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>📖 Esta semana</Text>
          </View>
          <Text style={styles.currentWeekLabel}>{reading.week_label}</Text>
          <Text style={styles.currentTitle} numberOfLines={2}>
            {reading.title}
          </Text>
          <Text style={styles.currentPassage} numberOfLines={1}>
            {reading.passage}
          </Text>
          {reading.has_pdf && (
            <View style={styles.currentPdfIndicator}>
              <Text style={styles.currentPdfText}>📄 Actividades disponibles</Text>
            </View>
          )}
          <View style={styles.currentCta}>
            <Text style={styles.currentCtaText}>Ver lectura →</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </AnimatedFade>
  );
}

export default function KidsReadingsScreen({ navigation }: Props) {
  const { colors, gradients, isDark } = useTheme();
  const shadows = createShadows(isDark);

  const [currentReading, setCurrentReading] = useState<KidsReading | null>(null);
  const [readings, setReadings] = useState<KidsReading[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [current, list] = await Promise.all([
        getCurrentKidsReading(),
        getKidsReadings(1),
      ]);
      setCurrentReading(current);
      setReadings(list.data);
      setLastPage(list.meta.last_page);
      setPage(1);
    } catch {
      setError('No se pudo cargar las lecturas. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadMore = async () => {
    if (isFetchingMore || page >= lastPage) return;
    setIsFetchingMore(true);
    try {
      const next = page + 1;
      const list = await getKidsReadings(next);
      setReadings((prev) => [...prev, ...list.data]);
      setPage(next);
    } catch {
      // Silently fail on pagination errors
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleReadingPress = useCallback(
    (id: number) => {
      navigation.navigate('KidsReadingDetail', { id });
    },
    [navigation]
  );

  // Filter out current reading from the list to avoid duplication
  const filteredReadings = readings.filter(
    (r) => !currentReading || r.id !== currentReading.id
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!currentReading && readings.length === 0) {
    return (
      <EmptyState
        icon="👶"
        message="Sin lecturas disponibles"
        detail="Pronto habrá nuevas lecturas para niños."
      />
    );
  }

  return (
    <FlatList
      style={[styles.root, { backgroundColor: colors.background }]}
      data={filteredReadings}
      keyExtractor={(r) => String(r.id)}
      contentContainerStyle={styles.list}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          {/* Current week's reading - highlighted */}
          {currentReading && (
            <View style={styles.currentSection}>
              <CurrentReadingCard
                reading={currentReading}
                colors={colors}
                shadows={shadows}
                gradients={gradients}
                onPress={() => handleReadingPress(currentReading.id)}
              />
            </View>
          )}

          {/* Past readings section header */}
          {filteredReadings.length > 0 && (
            <SectionHeader
              title="Lecturas anteriores"
              subtitle={`${filteredReadings.length} ${filteredReadings.length === 1 ? 'lectura' : 'lecturas'}`}
              style={styles.sectionHeader}
            />
          )}
        </View>
      }
      ListFooterComponent={
        isFetchingMore ? (
          <ActivityIndicator color={colors.gold} style={styles.footer} />
        ) : null
      }
      ListEmptyComponent={
        currentReading ? (
          <View style={styles.emptyPast}>
            <Text style={[styles.emptyPastText, { color: colors.textMuted }]}>
              No hay lecturas anteriores aún.
            </Text>
          </View>
        ) : null
      }
      renderItem={({ item, index }) => (
        <ReadingCard
          reading={item}
          index={index}
          colors={colors}
          shadows={shadows}
          onPress={() => handleReadingPress(item.id)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  list: {
    paddingBottom: 32,
  },
  footer: {
    marginVertical: 16,
  },

  // Current reading section
  currentSection: {
    padding: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  currentCard: {
    borderRadius: Radii.xl,
    padding: 20,
    paddingTop: 16,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
    marginBottom: 12,
  },
  currentBadgeText: {
    color: '#FFFCF0',
    fontSize: 12,
    fontWeight: '600',
  },
  currentWeekLabel: {
    color: 'rgba(255,252,240,0.7)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  currentTitle: {
    color: '#FFFCF0',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 28,
    marginBottom: 6,
  },
  currentPassage: {
    color: 'rgba(255,252,240,0.8)',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  currentPdfIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPdfText: {
    color: 'rgba(255,252,240,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  currentCta: {
    alignSelf: 'flex-end',
  },
  currentCtaText: {
    color: '#FFFCF0',
    fontSize: 14,
    fontWeight: '700',
  },

  // Section header
  sectionHeader: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  // Reading card
  card: {
    marginHorizontal: Spacing.base,
    marginBottom: 12,
    borderRadius: Radii.xl,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pdfBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  pdfBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  cardPassage: {
    fontSize: 14,
  },

  // Empty state for past readings
  emptyPast: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyPastText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
