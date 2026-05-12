import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TodayStackParamList } from '../navigation/types';
import { getQuestions } from '../api/readings';
import { submitAnswers } from '../api/answers';
import { Question } from '../types/api';
import QuestionCard from '../components/QuestionCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

type Props = NativeStackScreenProps<TodayStackParamList, 'Quiz'>;

export default function QuizScreen({ route, navigation }: Props) {
  const { dayId } = route.params;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allAnswered, setAllAnswered] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getQuestions(dayId);
      setQuestions(response.questions);
      setAllAnswered(response.allAnswered);
    } catch {
      setError('No se pudieron cargar las preguntas. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, [dayId]);

  useEffect(() => {
    load();
  }, [load]);

  // Check if all questions are answered (either by selection or comment)
  const canSubmit = questions.length > 0 && questions.every((q) => {
    const isOpenQuestion = q.answers.length === 0;
    if (isOpenQuestion) {
      return (comments[q.id]?.trim().length ?? 0) > 0;
    }
    return selectedAnswers[q.id] !== undefined;
  });

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const answers = questions.map((q) => {
        const isOpenQuestion = q.answers.length === 0;
        if (isOpenQuestion) {
          return {
            question_id: q.id,
            comment_user: comments[q.id],
          };
        }
        return {
          question_id: q.id,
          answer_id: selectedAnswers[q.id],
        };
      });
      const response = await submitAnswers(dayId, answers);
      navigation.replace('Results', {
        dayId,
        score: response.score,
        total: response.total,
        results: response.results,
        questions,
      });
    } catch {
      Alert.alert('Error', 'No se pudo enviar el quiz. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  if (allAnswered) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>✓</Text>
        <Text style={styles.emptyTitle}>¡Completado!</Text>
        <Text style={styles.emptyMessage}>
          Ya ha contestado las preguntas correspondientes a este día.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={questions}
        keyExtractor={(q) => String(q.id)}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <QuestionCard
            question={item}
            selectedAnswerId={selectedAnswers[item.id]}
            commentText={comments[item.id]}
            onSelect={(answerId) =>
              setSelectedAnswers((prev) => ({ ...prev, [item.id]: answerId }))
            }
            onCommentChange={(text) =>
              setComments((prev) => ({ ...prev, [item.id]: text }))
            }
          />
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            <Text style={styles.submitText}>
              {isSubmitting ? 'Enviando…' : 'Enviar respuestas'}
            </Text>
          </TouchableOpacity>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16, paddingBottom: 32 },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: { backgroundColor: '#d4b89a' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  emptyIcon: {
    fontSize: 48,
    color: '#10b981',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  backButton: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
