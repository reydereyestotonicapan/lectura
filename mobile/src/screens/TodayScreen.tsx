import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TodayStackParamList } from '../navigation/types';
import { getToday } from '../api/readings';
import { Day } from '../types/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<TodayStackParamList, 'Today'>;

export default function TodayScreen({ navigation }: Props) {
  const [day, setDay] = useState<Day | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await getToday();
      setDay(data);
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

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (notFound) return <EmptyState message="No hay lectura disponible para hoy." />;
  if (!day) return null;

  const totalQuestions = day.questions?.length ?? 0;
  const alreadyAnswered = (day.answered_count ?? 0) >= totalQuestions && totalQuestions > 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.dayMonth}>{day.day_month}</Text>
      <Text style={styles.date}>
        {new Date(day.date_assigned).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
      <View style={styles.card}>
        <Text style={styles.label}>Lectura</Text>
        <Text style={styles.chapters}>{day.chapters}</Text>
      </View>

      {alreadyAnswered ? (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>Quiz completado</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Quiz', { dayId: day.id })}
        >
          <Text style={styles.buttonText}>Comenzar Quiz</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  dayMonth: { fontSize: 13, fontWeight: '600', color: '#6366f1', textTransform: 'uppercase', marginBottom: 4 },
  date: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20, textTransform: 'capitalize' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  label: { fontSize: 12, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 },
  chapters: { fontSize: 18, color: '#1f2937', fontWeight: '500' },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  completedBadge: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  completedText: { color: '#15803d', fontWeight: '600', fontSize: 15 },
});
