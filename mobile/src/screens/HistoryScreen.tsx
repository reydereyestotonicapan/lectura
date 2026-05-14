import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getResponses } from '../api/readings';
import { Colors } from '../theme';
import { UserResponse } from '../types/api';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

type StatusType = 'Correcta' | 'Incorrecta' | 'Pendiente';

const STATUS_CONFIG: Record<StatusType, { color: string; bg: string; icon: string }> = {
  Correcta: { color: '#15803d', bg: '#dcfce7', icon: '✓' },
  Incorrecta: { color: '#dc2626', bg: '#fee2e2', icon: '✗' },
  Pendiente: { color: '#ca8a04', bg: '#fef9c3', icon: '?' },
};

function ResponseCard({ response }: { response: UserResponse }) {
  const config = STATUS_CONFIG[response.status];

  return (
    <View style={styles.card}>
      {/* Header: Day info + Status badge */}
      <View style={styles.cardHeader}>
        <View style={styles.dayInfo}>
          <Text style={styles.dayMonth}>{response.day_month}</Text>
          <Text style={styles.chapters} numberOfLines={1}>{response.chapters}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.statusIcon, { color: config.color }]}>{config.icon}</Text>
          <Text style={[styles.statusText, { color: config.color }]}>{response.status}</Text>
        </View>
      </View>

      {/* Question */}
      <Text style={styles.question}>
        {response.question}
      </Text>

      {/* Answers section */}
      <View style={styles.answersSection}>
        <View style={styles.answerRow}>
          <Text style={styles.answerLabel}>Tu respuesta:</Text>
          <Text style={[
            styles.answerValue,
            response.status === 'Correcta' && styles.correctAnswer,
            response.status === 'Incorrecta' && styles.incorrectAnswer,
          ]}>
            {response.your_answer || '—'}
          </Text>
        </View>

        {response.correct_answer && response.status !== 'Correcta' && (
          <View style={styles.answerRow}>
            <Text style={styles.answerLabel}>Correcta:</Text>
            <Text style={[styles.answerValue, styles.correctAnswer]}>
              {response.correct_answer}
            </Text>
          </View>
        )}
      </View>

      {/* Team comment (if any) */}
      {response.team_comment && (
        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>Comentario del equipo:</Text>
          <Text style={styles.commentText}>
            {response.team_comment}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (p: number) => {
    try {
      const data = await getResponses(p);
      if (p === 1) setResponses(data.data);
      else setResponses((prev) => [...prev, ...data.data]);
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
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  if (error) return <ErrorState message={error} onRetry={init} />;
  if (responses.length === 0) return <EmptyState message="No hay respuestas registradas." />;

  return (
    <FlatList
      data={responses}
      keyExtractor={(r) => String(r.id)}
      contentContainerStyle={styles.list}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={isFetchingMore ? <ActivityIndicator color={Colors.primary} style={styles.footer} /> : null}
      renderItem={({ item }) => <ResponseCard response={item} />}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  footer: { marginVertical: 16 },
  
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
    marginBottom: 12,
  },
  dayInfo: {
    flex: 1,
    marginRight: 12,
  },
  dayMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chapters: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  question: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 12,
  },
  
  answersSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  answerRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  answerLabel: {
    fontSize: 13,
    color: '#6b7280',
    width: 100,
  },
  answerValue: {
    fontSize: 13,
    color: '#111827',
    flex: 1,
    fontWeight: '500',
  },
  correctAnswer: {
    color: '#15803d',
  },
  incorrectAnswer: {
    color: '#dc2626',
  },
  
  commentSection: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  commentLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
});
