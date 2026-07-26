import React, { useEffect, useState, useCallback, useLayoutEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, RefreshControl, AppState } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { TodayStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { getToday } from '../api/readings';
import { Day } from '../types/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import DayReadingBody from '../components/DayReadingBody';
import { useChapterProgress } from '../hooks/useChapterProgress';
import { useUserSettings } from '../hooks/useUserSettings';
import { useAuth } from '../auth/AuthContext';
import { useReadingActions } from '../hooks/useReadingActions';
import { usePlanProgress } from '../hooks/usePlanProgress';

type Props = NativeStackScreenProps<TodayStackParamList, 'Today'>;

export default function TodayScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [day, setDay] = useState<Day | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const { chapters, isLoading: isLoadingChapters, error: chapterError, toggleChapter, refreshProgress } =
    useChapterProgress(day?.id ?? null);
  const { isGuest, exitGuestMode } = useAuth();
  const { settings, refreshSettings } = useUserSettings();
  const { planProgress, refreshPlanProgress } = usePlanProgress();

  const { handleRead, handleWatch, handleToggle } = useReadingActions({
    bibleSource: settings.bible_source,
    isGuest,
    toggleChapter,
    exitGuestMode,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={headerStyles.titleWrap}>
          <Image
            source={require('../../assets/app-icon.png')}
            style={headerStyles.icon}
            resizeMode="contain"
          />
          <Text style={[headerStyles.title, { color: colors.textPrimary }]}>gRafé</Text>
        </View>
      ),
      headerRight: isGuest
        ? () => (
            <TouchableOpacity onPress={exitGuestMode} style={headerStyles.btn}>
              <Text style={[headerStyles.btnText, { color: colors.primary }]}>Iniciar sesión</Text>
            </TouchableOpacity>
          )
        : () => (
            <TouchableOpacity onPress={() => navigation.navigate('ReadingsList')} style={headerStyles.btn}>
              <Text style={[headerStyles.btnText, { color: colors.primary }]}>Lecturas</Text>
            </TouchableOpacity>
          ),
    });
  }, [navigation, isGuest, exitGuestMode, colors]);

  useFocusEffect(
    useCallback(() => {
      refreshSettings();
      refreshPlanProgress();
    }, [refreshSettings, refreshPlanProgress])
  );

  const appStateRef = useRef(AppState.currentState);
  const lastRefreshRef = useRef(0);

  // Core fetch of today's reading + chapters. Never touches the full-screen
  // loading state, so it can run silently in the background. When `silent`,
  // a transient network error is swallowed so we keep showing existing content
  // instead of flashing the error screen on resume.
  const fetchToday = useCallback(
    async (silent = false) => {
      if (!silent) {
        setError(null);
        setNotFound(false);
      }
      try {
        const data = await getToday();
        setDay(data);
        setError(null);
        setNotFound(false);
        lastRefreshRef.current = Date.now();
        await Promise.all([refreshProgress(), refreshSettings(), refreshPlanProgress()]);
      } catch (err: any) {
        if (err.response?.status === 404) setNotFound(true);
        else if (!silent) setError('No se pudo cargar la lectura. Verifica tu conexión.');
      }
    },
    [refreshProgress, refreshSettings, refreshPlanProgress]
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await getToday();
      setDay(data);
      lastRefreshRef.current = Date.now();
    } catch (err: any) {
      if (err.response?.status === 404) setNotFound(true);
      else setError('No se pudo cargar la lectura. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Manual pull-to-refresh — shows the pull spinner.
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchToday();
    } finally {
      setRefreshing(false);
    }
  }, [fetchToday]);

  // Keep a stable ref to the latest fetch so the AppState listener can be
  // registered once (below) rather than resubscribing on every dep change.
  const fetchTodayRef = useRef(fetchToday);
  useEffect(() => {
    fetchTodayRef.current = fetchToday;
  }, [fetchToday]);

  // Auto-refresh whenever the app returns to the foreground. We always refetch
  // (the server decides what "today" is) instead of trusting the device clock,
  // which can read stale right after resume. Registered once to avoid resubscribe
  // races; runs silently and is throttled to dedupe repeated AppState events.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      const resumed = (prev === 'background' || prev === 'inactive') && next === 'active';
      if (resumed && Date.now() - lastRefreshRef.current > 5000) {
        // Delay briefly so the app finishes foregrounding / network settles.
        setTimeout(() => {
          fetchTodayRef.current(true);
        }, 400);
      }
    });
    return () => sub.remove();
  }, []);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (notFound) return (
    <EmptyState
      icon="🌅"
      message="Sin lectura para hoy"
      detail="Vuelve mañana para continuar tu plan de lectura."
    />
  );
  if (!day) return null;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <DayReadingBody
        day={day}
        chapters={chapters}
        isLoadingChapters={isLoadingChapters}
        chapterError={chapterError}
        planProgress={planProgress}
        isToday
        onToggle={handleToggle}
        onRead={handleRead}
        onWatch={handleWatch}
        onOpenQuiz={() => navigation.navigate('Quiz', { dayId: day.id })}
      />
    </ScrollView>
  );
}

const headerStyles = StyleSheet.create({
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  btn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  btnText: {
    fontWeight: '600',
    fontSize: 15,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingBottom: 48,
  },
});
