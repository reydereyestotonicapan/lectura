import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Radii, Spacing, createShadows } from '../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TodayStackParamList } from '../navigation/types';
import { getQuestions } from '../api/readings';
import { submitAnswers } from '../api/answers';
import { Question } from '../types/api';
import QuestionCard from '../components/QuestionCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import AnimatedFade from '../components/ui/AnimatedFade';
import { useAuth } from '../auth/AuthContext';

type Props = NativeStackScreenProps<TodayStackParamList, 'Quiz'>;

export default function QuizScreen({ route, navigation }: Props) {
  const { dayId } = route.params;
  const { colors, gradients, isDark } = useTheme();
  const shadows = createShadows(isDark);
  const { isGuest, exitGuestMode } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allAnswered, setAllAnswered] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const answeredCount = questions.filter((q) => {
    const isOpen = q.answers.length === 0;
    return isOpen ? (comments[q.id]?.trim().length ?? 0) > 0 : selectedAnswers[q.id] !== undefined;
  }).length;

  const canSubmit = questions.length > 0 && answeredCount === questions.length;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (isGuest) {
      setShowLoginModal(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const answers = questions.map((q) => {
        const isOpen = q.answers.length === 0;
        return isOpen
          ? { question_id: q.id, comment_user: comments[q.id] }
          : { question_id: q.id, answer_id: selectedAnswers[q.id] };
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
      Alert.alert('Error', 'No se pudieron enviar las respuestas. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  if (allAnswered) {
    return (
      <View style={[styles.completedContainer, { backgroundColor: colors.background }]}>
        <AnimatedFade style={styles.completedContent}>
          <View style={[styles.completedIconWrap, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
            <Text style={[styles.completedIcon, { color: colors.success }]}>✓</Text>
          </View>
          <Text style={[styles.completedTitle, { color: colors.textPrimary }]}>¡Ya completaste esto!</Text>
          <Text style={[styles.completedMsg, { color: colors.textMuted }]}>
            Ya contestaste las preguntas de este día.
          </Text>
          <TouchableOpacity style={[styles.backBtn, { borderColor: colors.primary }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtnText, { color: colors.primary }]}>Volver</Text>
          </TouchableOpacity>
        </AnimatedFade>
      </View>
    );
  }

  const progressPct = questions.length > 0 ? answeredCount / questions.length : 0;

  return (
    <>
      <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Progress bar at top */}
        <View style={[styles.progressWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${progressPct * 100}%`, backgroundColor: colors.gold }]} />
          </View>
          <Text style={[styles.progressLabel, { color: colors.gold }]}>
            {answeredCount} de {questions.length}
          </Text>
        </View>

        <FlatList
          data={questions}
          keyExtractor={(q) => String(q.id)}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <AnimatedFade delay={index * 60} key={item.id}>
              <QuestionCard
                question={item}
                questionIndex={index}
                selectedAnswerId={selectedAnswers[item.id]}
                commentText={comments[item.id]}
                onSelect={(answerId) =>
                  setSelectedAnswers((prev) => ({ ...prev, [item.id]: answerId }))
                }
                onCommentChange={(text) =>
                  setComments((prev) => ({ ...prev, [item.id]: text }))
                }
              />
            </AnimatedFade>
          )}
          ListFooterComponent={
            <View style={styles.submitWrap}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                activeOpacity={0.88}
                style={[styles.submitBtn, shadows.gold, (!canSubmit || isSubmitting) && styles.submitBtnDisabled]}
              >
                <LinearGradient
                  colors={!canSubmit ? [colors.textDisabled, colors.borderMed] : gradients.gold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>
                    {isSubmitting ? 'Enviando…' : 'Enviar respuestas'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      </KeyboardAvoidingView>

      {/* Guest modal */}
      <Modal visible={showLoginModal} transparent animationType="slide" onRequestClose={() => setShowLoginModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={styles.modalIcon}>🎉</Text>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>¡Ya casi terminas!</Text>
            <Text style={[styles.modalMessage, { color: colors.textMuted }]}>
              Crea tu cuenta para guardar tus respuestas, ver tu historial y ganar reconocimientos mensuales.
            </Text>
            <TouchableOpacity
              style={[styles.modalPrimary, shadows.gold]}
              onPress={() => { setShowLoginModal(false); exitGuestMode(); }}
            >
              <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalPrimaryGradient}>
                <Text style={styles.modalPrimaryText}>Iniciar sesión</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSecondary} onPress={() => setShowLoginModal(false)}>
              <Text style={[styles.modalSecondaryText, { color: colors.textMuted }]}>Seguir explorando</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },

  list: { padding: Spacing.base, paddingBottom: 32 },

  submitWrap: { marginTop: 8, paddingBottom: 8 },
  submitBtn: { borderRadius: Radii.xl, overflow: 'hidden' },
  submitBtnDisabled: { shadowOpacity: 0, elevation: 0 },
  submitGradient: { paddingVertical: 18, alignItems: 'center', borderRadius: Radii.xl },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  completedContent: { alignItems: 'center' },
  completedIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  completedIcon: { fontSize: 36 },
  completedTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  completedMsg: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  backBtn: {
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: Radii.lg,
  },
  backBtnText: { fontSize: 16, fontWeight: '600' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28,20,16,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 28,
  },
  modalIcon: { fontSize: 44, marginBottom: 12 },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  modalMessage: { fontSize: 15, textAlign: 'center', lineHeight: 23, marginBottom: 28 },
  modalPrimary: { width: '100%', borderRadius: Radii.lg, overflow: 'hidden', marginBottom: 12 },
  modalPrimaryGradient: { paddingVertical: 17, alignItems: 'center', borderRadius: Radii.lg },
  modalPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalSecondary: { paddingVertical: 14, alignItems: 'center', width: '100%' },
  modalSecondaryText: { fontSize: 15 },
});
