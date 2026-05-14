import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ReadingsStackParamList } from '../navigation/types';
import { getReadings } from '../api/readings';
import { Day } from '../types/api';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<ReadingsStackParamList, 'ReadingsList'>;

function DayCard({ day, onPress }: { day: Day; onPress: () => void }) {
  const totalQuestions = day.questions?.length ?? day.questions_count ?? 0;
  const answeredCount = day.answered_count ?? 0;
  const pendingCount = Math.max(0, totalQuestions - answeredCount);
  const isCompleted = pendingCount === 0 && answeredCount > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.dayMonth}>{day.day_month}</Text>
          <Text style={styles.chapters} numberOfLines={1}>{day.chapters}</Text>
        </View>
        {isCompleted ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ Completado</Text>
          </View>
        ) : pendingCount > 0 ? (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>{pendingCount} pendiente{pendingCount > 1 ? 's' : ''}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.date}>
        {new Date(day.date_assigned + 'T00:00:00').toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
        })}
      </Text>
    </TouchableOpacity>
  );
}

export default function ReadingsScreen({ navigation }: Props) {
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

  useEffect(() => {
    init();
  }, [init]);

  // Refresh data when screen comes into focus (after completing a quiz)
  useFocusEffect(
    useCallback(() => {
      if (!isLoading) {
        loadPage(1).then(() => setPage(1));
      }
    }, [loadPage, isLoading])
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  if (error) return <ErrorState message={error} onRetry={init} />;
  if (days.length === 0) return <EmptyState message="No hay lecturas disponibles." />;

  return (
    <FlatList
      data={days}
      keyExtractor={(d) => String(d.id)}
      contentContainerStyle={styles.list}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      ListHeaderComponent={
        <Text style={styles.header}>Selecciona un día para responder</Text>
      }
      ListFooterComponent={
        isFetchingMore ? <ActivityIndicator color={Colors.primary} style={styles.footer} /> : null
      }
      renderItem={({ item }) => (
        <DayCard
          day={item}
          onPress={() => navigation.navigate('Quiz', { dayId: item.id })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  footer: { marginVertical: 16 },
  header: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dayMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chapters: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
    maxWidth: 200,
  },
  date: {
    fontSize: 13,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  pendingBadge: {
    backgroundColor: '#fef9c3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    color: '#ca8a04',
    fontSize: 12,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '600',
  },
});
