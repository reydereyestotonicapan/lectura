import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getResponses } from '../api/readings';
import { useTheme, Radii, Spacing, createShadows, ThemeColors } from '../theme';
import { UserResponse } from '../types/api';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import AnimatedFade from '../components/ui/AnimatedFade';

type StatusType = 'Correcta' | 'Incorrecta' | 'Pendiente';

const getStatusConfig = (colors: ThemeColors) => ({
  Correcta: { color: colors.success, bg: colors.successBg, border: colors.successBorder, icon: '✓' },
  Incorrecta: { color: colors.error, bg: colors.errorBg, border: colors.errorBorder, icon: '✗' },
  Pendiente: { color: colors.warning, bg: colors.warningBg, border: colors.warningBorder, icon: '?' },
});

function ResponseCard({ response, index, colors, shadows }: { response: UserResponse; index: number; colors: ThemeColors; shadows: ReturnType<typeof createShadows> }) {
  const statusConfig = getStatusConfig(colors);
  const cfg = statusConfig[response.status];

  return (
    <AnimatedFade delay={Math.min(index * 40, 240)}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}>
        {/* Header */}
        <View style={styles.cardTop}>
          <View style={styles.dayInfo}>
            <Text style={[styles.dayMonth, { color: colors.gold }]}>{response.day_month}</Text>
            <Text style={[styles.chapters, { color: colors.textMuted }]} numberOfLines={1}>{response.chapters}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            <Text style={[styles.badgeIcon, { color: cfg.color }]}>{cfg.icon}</Text>
            <Text style={[styles.badgeText, { color: cfg.color }]}>{response.status}</Text>
          </View>
        </View>

        {/* Question */}
        <Text style={[styles.question, { color: colors.textPrimary }]}>{response.question}</Text>

        {/* Answers */}
        <View style={[styles.answers, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.answerRow}>
            <Text style={[styles.answerLabel, { color: colors.textMuted }]}>Tu respuesta</Text>
            <Text
              style={[
                styles.answerValue,
                { color: colors.textSecondary },
                response.status === 'Correcta' && { color: colors.success },
                response.status === 'Incorrecta' && { color: colors.error },
              ]}
            >
              {response.your_answer || '—'}
            </Text>
          </View>

          {response.correct_answer && response.status !== 'Correcta' && (
            <View style={styles.answerRow}>
              <Text style={[styles.answerLabel, { color: colors.textMuted }]}>Correcta</Text>
              <Text style={[styles.answerValue, { color: colors.success, fontWeight: '600' }]}>
                {response.correct_answer}
              </Text>
            </View>
          )}
        </View>

        {/* Team comment */}
        {response.team_comment ? (
          <View style={[styles.teamComment, { backgroundColor: colors.primaryLight, borderColor: colors.borderMed }]}>
            <Text style={[styles.teamCommentLabel, { color: colors.primary }]}>💬 Comentario del equipo</Text>
            <Text style={[styles.teamCommentText, { color: colors.textSecondary }]}>{response.team_comment}</Text>
          </View>
        ) : null}
      </View>
    </AnimatedFade>
  );
}

export default function HistoryScreen() {
  const { colors, isDark } = useTheme();
  const shadows = createShadows(isDark);
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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }
  if (error) return <ErrorState message={error} onRetry={init} />;
  if (responses.length === 0) {
    return (
      <EmptyState
        icon="📋"
        message="Sin historial aún"
        detail="Completa las preguntas diarias para ver tus respuestas aquí."
      />
    );
  }

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
        <Text style={[styles.listHeader, { color: colors.textMuted }]}>Tu historial de respuestas</Text>
      }
      ListFooterComponent={
        isFetchingMore ? (
          <ActivityIndicator color={colors.gold} style={styles.footer} />
        ) : null
      }
      renderItem={({ item, index }) => <ResponseCard response={item} index={index} colors={colors} shadows={shadows} />}
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
    borderRadius: Radii.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dayInfo: { flex: 1, marginRight: 10 },
  dayMonth: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chapters: {
    fontSize: 13,
    marginTop: 3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.full,
    borderWidth: 1,
    gap: 4,
  },
  badgeIcon: { fontSize: 11, fontWeight: '800' },
  badgeText: { fontSize: 12, fontWeight: '700' },

  question: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 12,
  },

  answers: {
    borderRadius: Radii.md,
    padding: 12,
    borderWidth: 1,
    gap: 6,
  },
  answerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 90,
    paddingTop: 1,
  },
  answerValue: {
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },

  teamComment: {
    borderRadius: Radii.md,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
  },
  teamCommentLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  teamCommentText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
