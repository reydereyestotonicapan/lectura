import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getReadings } from '../api/readings';
import { Day } from '../types/api';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

export default function HistoryScreen() {
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
      if (p === 1) setError('No se pudo cargar el historial.');
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
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }
  if (error) return <ErrorState message={error} onRetry={init} />;
  if (days.length === 0) return <EmptyState message="No hay lecturas registradas." />;

  return (
    <FlatList
      data={days}
      keyExtractor={(d) => String(d.id)}
      contentContainerStyle={styles.list}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={isFetchingMore ? <ActivityIndicator color="#6366f1" style={styles.footer} /> : null}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.dayMonth}>{item.day_month}</Text>
          <Text style={styles.chapters} numberOfLines={1}>{item.chapters}</Text>
          <Text style={styles.date}>
            {new Date(item.date_assigned).toLocaleDateString('es-ES', {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </Text>
          {item.answered_count !== undefined && (
            <Text style={styles.answered}>{item.answered_count} respondidas</Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  footer: { marginVertical: 16 },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  dayMonth: { fontSize: 12, fontWeight: '600', color: '#6366f1', textTransform: 'uppercase', marginBottom: 2 },
  chapters: { fontSize: 15, fontWeight: '500', color: '#111827', marginBottom: 4 },
  date: { fontSize: 13, color: '#6b7280' },
  answered: { fontSize: 12, color: '#22c55e', fontWeight: '600', marginTop: 4 },
});
