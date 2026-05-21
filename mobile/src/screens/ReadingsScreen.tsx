import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme, Radii, Spacing, createShadows } from '../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { TodayStackParamList } from '../navigation/types';
import { getReadings } from '../api/readings';
import { Day } from '../types/api';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import AnimatedFade from '../components/ui/AnimatedFade';

type Props = NativeStackScreenProps<TodayStackParamList, 'ReadingsList'>;

function DayCard({ day, onPress, index }: { day: Day; onPress: () => void; index: number }) {
  const { colors, isDark } = useTheme();
  const shadows = createShadows(isDark);
  const total = day.questions?.length ?? day.questions_count ?? 0;
  const answered = day.answered_count ?? 0;
  const pending = Math.max(0, total - answered);
  const completed = pending === 0 && answered > 0;

  return (
    <AnimatedFade delay={Math.min(index * 40, 200)}>
      <TouchableOpacity 
        style={[
          styles.card, 
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadows.sm
        ]} 
        onPress={onPress} 
        activeOpacity={0.8}
      >
        {/* Left accent stripe */}
        <View style={[styles.stripe, { backgroundColor: completed ? colors.success : colors.gold }]} />

        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={styles.cardLeft}>
              <Text style={[styles.dayMonth, { color: colors.gold }]}>{day.day_month}</Text>
              <Text style={[styles.chapters, { color: colors.textPrimary }]} numberOfLines={1}>{day.chapters}</Text>
              <Text style={[styles.date, { color: colors.textMuted }]}>
                {new Date(day.date_assigned + 'T00:00:00').toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </View>

            {completed ? (
              <View style={[styles.completedBadge, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
                <Text style={[styles.completedText, { color: colors.success }]}>✓</Text>
              </View>
            ) : pending > 0 ? (
              <View style={[styles.pendingBadge, { backgroundColor: colors.warningBg, borderColor: colors.warningBorder }]}>
                <Text style={[styles.pendingText, { color: colors.warning }]}>{pending}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text style={[styles.arrow, { color: colors.textDisabled }]}>›</Text>
      </TouchableOpacity>
    </AnimatedFade>
  );
}

export default function ReadingsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [days, setDays] = useState<Day[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (p: number) => {
    try {
      const data = await getReadings(p);
      if (p === 1) setDays(data.data);
      else setDays((prev) => [...prev, ...data.data]);
      setLastPage(data.meta.last_page);
    } catch {
      if (p === 1) setError('No se pudieron cargar las lecturas.');
    }
  }, []);

  const init = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await loadPage(1);
    setPage(1);
    setIsLoading(false);
  }, [loadPage]);

  useEffect(() => { init(); }, [init]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoading) loadPage(1).then(() => setPage(1));
    }, [loadPage, isLoading])
  );

  const loadMore = async () => {
    if (isFetchingMore || page >= lastPage) return;
    setIsFetchingMore(true);
    await loadPage(page + 1);
    setPage((p) => p + 1);
    setIsFetchingMore(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }
  if (error) return <ErrorState message={error} onRetry={init} />;
  if (days.length === 0) {
    return <EmptyState icon="📅" message="Sin lecturas disponibles" detail="Vuelve más tarde." />;
  }

  return (
    <FlatList
      style={[styles.root, { backgroundColor: colors.background }]}
      data={days}
      keyExtractor={(d) => String(d.id)}
      contentContainerStyle={styles.list}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Text style={[styles.header, { color: colors.textMuted }]}>Selecciona un día para responder</Text>
      }
      ListFooterComponent={
        isFetchingMore ? <ActivityIndicator color={colors.gold} style={styles.footer} /> : null
      }
      renderItem={({ item, index }) => (
        <DayCard
          day={item}
          index={index}
          onPress={() => navigation.navigate('Quiz', { dayId: item.id })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.base, paddingBottom: 32 },
  footer: { marginVertical: 16 },
  header: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.xl,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: { flex: 1 },
  dayMonth: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  chapters: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  date: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 13,
    fontWeight: '800',
  },
  pendingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '800',
  },
  arrow: {
    fontSize: 22,
    paddingRight: 14,
    fontWeight: '300',
  },
});
