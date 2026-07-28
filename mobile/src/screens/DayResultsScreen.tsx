import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HistoryStackParamList } from '../navigation/HistoryStack';
import { getResponses } from '../api/readings';
import { UserResponse } from '../types/api';
import { useTheme, Spacing } from '../theme';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ResponseCard from '../components/ResponseCard';

type Props = NativeStackScreenProps<HistoryStackParamList, 'DayResults'>;

function capitalizedDate(dateStr: string) {
  const s = new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function DayResultsScreen({ route, navigation }: Props) {
  const { dayId, date } = route.params;
  const { colors } = useTheme();

  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: date ? capitalizedDate(date) : 'Resultados' });
  }, [navigation, date]);

  const loadPage = useCallback(
    async (p: number) => {
      try {
        const data = await getResponses(p, dayId);
        if (p === 1) setResponses(data.data);
        else setResponses((prev) => [...prev, ...data.data]);
        setLastPage(data.meta.last_page);
      } catch {
        if (p === 1) setError('No se pudieron cargar los resultados.');
      }
    },
    [dayId]
  );

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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }
  if (error) return <ErrorState message={error} onRetry={init} />;
  if (responses.length === 0) {
    return <EmptyState icon="📋" message="Sin respuestas" detail="No hay respuestas registradas para este día." />;
  }

  const chapters = responses[0]?.chapters;

  return (
    <FlatList
      style={[styles.root, { backgroundColor: colors.background }]}
      data={responses}
      keyExtractor={(r) => String(r.id)}
      contentContainerStyle={styles.list}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        chapters ? <Text style={[styles.listHeader, { color: colors.textMuted }]}>{chapters}</Text> : null
      }
      ListFooterComponent={isFetchingMore ? <ActivityIndicator color={colors.gold} style={styles.footer} /> : null}
      renderItem={({ item, index }) => <ResponseCard response={item} index={index} showDayHeader={false} />}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.base, paddingBottom: 32 },
  footer: { marginVertical: 16 },
  listHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
});
