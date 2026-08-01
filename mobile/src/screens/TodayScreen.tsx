import React, { useEffect, useState, useCallback, useLayoutEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, RefreshControl, AppState } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { TodayStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { getDayView, DayView } from '../api/readings';
import { Day } from '../types/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import DayReadingBody from '../components/DayReadingBody';
import { useChapterProgress } from '../hooks/useChapterProgress';
import { useUserSettings } from '../hooks/useUserSettings';
import { useAuth } from '../auth/AuthContext';
import { useReadingActions } from '../hooks/useReadingActions';
import { useMonthlyProgress } from '../hooks/useMonthlyProgress';

type Props = NativeStackScreenProps<TodayStackParamList, 'Today'>;

export default function TodayScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [day, setDay] = useState<Day | null>(null);
  const [prevDate, setPrevDate] = useState<string | null>(null);
  const [nextDate, setNextDate] = useState<string | null>(null);
  const [todayDate, setTodayDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [navBusy, setNavBusy] = useState(false);

  const { chapters, isLoading: isLoadingChapters, error: chapterError, toggleChapter, refreshProgress } =
    useChapterProgress(day?.id ?? null);
  const { isGuest, exitGuestMode } = useAuth();
  const { settings, refreshSettings } = useUserSettings();
  const { monthlyProgress, refreshMonthlyProgress } = useMonthlyProgress();

  const { handleRead, handleWatch, handleToggle } = useReadingActions({
    bibleSource: settings.bible_source,
    isGuest,
    toggleChapter,
    exitGuestMode,
  });

  const isViewingToday = day != null && todayDate != null && day.date_assigned === todayDate;

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

  const appStateRef = useRef(AppState.currentState);
  const lastRefreshRef = useRef(0);

  const applyView = useCallback((view: DayView, isTodayLoad: boolean) => {
    setDay(view.day);
    setPrevDate(view.prevDate);
    setNextDate(view.nextDate);
    if (isTodayLoad) setTodayDate(view.day.date_assigned);
  }, []);

  // Initial full-screen load of today's reading.
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      applyView(await getDayView(), true);
      lastRefreshRef.current = Date.now();
    } catch (err: any) {
      if (err.response?.status === 404) setNotFound(true);
      else setError('No se pudo cargar la lectura. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, [applyView]);

  useEffect(() => {
    load();
  }, [load]);

  // Navigate to an adjacent day (or back to today) in place — no full-screen
  // spinner. Chapters refetch automatically as the day id changes.
  const goToDate = useCallback(
    async (date?: string) => {
      setNavBusy(true);
      try {
        applyView(await getDayView(date), !date);
        setError(null);
        setNotFound(false);
        lastRefreshRef.current = Date.now();
        refreshMonthlyProgress();
      } catch {
        // Keep the current day on a transient failure.
      } finally {
        setNavBusy(false);
      }
    },
    [applyView, refreshMonthlyProgress]
  );

  // Silent refresh of the currently viewed day (pull-to-refresh, resume, focus).
  // Reloads the same date so answered counts / progress stay current.
  const refreshCurrent = useCallback(
    async (silent = false) => {
      const date = isViewingToday ? undefined : day?.date_assigned;
      try {
        applyView(await getDayView(date), !date);
        setError(null);
        setNotFound(false);
        lastRefreshRef.current = Date.now();
        await Promise.all([refreshProgress(), refreshSettings(), refreshMonthlyProgress()]);
      } catch (err: any) {
        if (err.response?.status === 404 && !date) setNotFound(true);
        else if (!silent) setError('No se pudo cargar la lectura. Verifica tu conexión.');
      }
    },
    [isViewingToday, day?.date_assigned, applyView, refreshProgress, refreshSettings, refreshMonthlyProgress]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshCurrent(true);
    } finally {
      setRefreshing(false);
    }
  }, [refreshCurrent]);

  // Refresh settings on focus; after the first focus also refresh the viewed day
  // so answering its quiz (then returning) reflects immediately.
  const didFocus = useRef(false);
  useFocusEffect(
    useCallback(() => {
      refreshSettings();
      if (didFocus.current) refreshCurrent(true);
      else didFocus.current = true;
    }, [refreshSettings, refreshCurrent])
  );

  // Auto-refresh the viewed day whenever the app returns to the foreground.
  // Registered once; uses a ref to reach the latest refresh closure.
  const refreshCurrentRef = useRef(refreshCurrent);
  useEffect(() => {
    refreshCurrentRef.current = refreshCurrent;
  }, [refreshCurrent]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      const resumed = (prev === 'background' || prev === 'inactive') && next === 'active';
      if (resumed && Date.now() - lastRefreshRef.current > 5000) {
        setTimeout(() => {
          refreshCurrentRef.current(true);
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
        monthlyProgress={monthlyProgress}
        isToday={isViewingToday}
        nav={{
          onPrev: () => prevDate && goToDate(prevDate),
          onNext: () => nextDate && goToDate(nextDate),
          canPrev: !!prevDate && !navBusy,
          canNext: !!nextDate && !navBusy,
          onToday: () => goToDate(undefined),
          isToday: isViewingToday,
        }}
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
