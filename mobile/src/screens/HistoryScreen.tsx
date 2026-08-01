import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HistoryStackParamList } from '../navigation/HistoryStack';
import { getResultDays, ResultDay } from '../api/readings';
import { useTheme, Radii, Spacing, createShadows } from '../theme';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import AnimatedFade from '../components/ui/AnimatedFade';

type Props = NativeStackScreenProps<HistoryStackParamList, 'HistoryList'>;

function ResultDayCard({ day, index, onPress }: { day: ResultDay; index: number; onPress: () => void }) {
  const { colors, isDark } = useTheme();
  const shadows = createShadows(isDark);

  const allCorrect = day.pending_count === 0 && day.correct_count === day.answered_count;
  const stripe = day.pending_count > 0 ? colors.warning : allCorrect ? colors.success : colors.gold;

  return (
    <AnimatedFade delay={Math.min(index * 40, 200)}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.stripe, { backgroundColor: stripe }]} />

        <View style={styles.cardBody}>
          <Text style={[styles.dayMonth, { color: colors.gold }]}>{day.day_month}</Text>
          <Text style={[styles.chapters, { color: colors.textPrimary }]} numberOfLines={1}>{day.chapters}</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summary, { color: colors.textMuted }]}>
              ✓ {day.correct_count}/{day.answered_count}
            </Text>
            {day.pending_count > 0 ? (
              <Text style={[styles.summary, { color: colors.warning }]}>
                · {day.pending_count} pendiente{day.pending_count === 1 ? '' : 's'}
              </Text>
            ) : null}
          </View>
        </View>

        <Text style={[styles.arrow, { color: colors.textDisabled }]}>›</Text>
      </TouchableOpacity>
    </AnimatedFade>
  );
}

export default function HistoryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [days, setDays] = useState<ResultDay[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (p: number) => {
    try {
      const data = await getResultDays(p);
      if (p === 1) setDays(data.data);
      else setDays((prev) => [...prev, ...data.data]);
      setLastPage(data.meta.last_page);
    } catch {
      if (p === 1) setError('No se pudieron cargar los resultados.');
    }
  }, []);

  const init = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await loadPage(1);
    setPage(1);
    setIsLoading(false);
  }, [loadPage]);

  // Reload every time the screen comes into focus (e.g. after answering a quiz).
  useFocusEffect(
    useCallback(() => {
      init();
    }, [init])
  );

  const loadMore = async () => {
    if (isFetchingMore || page >= lastPage) return;
    setIsFetchingMore(true);
    const next = page + 1;
    await loadPage(next);
    setPage(next);
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
    return (
      <EmptyState
        icon="📋"
        message="Sin resultados aún"
        detail="Completa las preguntas diarias para ver tus resultados aquí."
      />
    );
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
        <Text style={[styles.listHeader, { color: colors.textMuted }]}>Toca un día para ver tus respuestas</Text>
      }
      ListFooterComponent={isFetchingMore ? <ActivityIndicator color={colors.gold} style={styles.footer} /> : null}
      renderItem={({ item, index }) => (
        <ResultDayCard
          day={item}
          index={index}
          onPress={() => navigation.navigate('DayResults', { dayId: item.id, date: item.date_assigned })}
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
  listHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 14,
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
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  summary: {
    fontSize: 13,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 22,
    paddingRight: 14,
    fontWeight: '300',
  },
});
