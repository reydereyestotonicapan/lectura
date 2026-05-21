import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, Radii, createShadows } from '../theme';
import { Question, SubmitResult } from '../types/api';

interface Props {
  question: Question;
  result: SubmitResult;
}

export default function ResultItem({ question, result }: Props) {
  const { colors, isDark } = useTheme();
  const shadows = createShadows(isDark);
  const isOpen = result.is_open_question;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}>
      <Text style={[styles.questionText, { color: colors.textPrimary }]}>{question.description}</Text>

      {isOpen ? (
        <View>
          <View style={[styles.pendingBadge, { backgroundColor: colors.warningBg, borderColor: colors.warningBorder }]}>
            <Text style={[styles.pendingText, { color: colors.warning }]}>⏳  Pendiente de revisión</Text>
          </View>
          <View style={[styles.commentBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.commentLabel, { color: colors.textMuted }]}>Tu respuesta</Text>
            <Text style={[styles.commentText, { color: colors.textSecondary }]}>{result.comment_user}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.answersWrap}>
          {question.answers.map((answer) => {
            const isChoice = answer.id === result.answer_id;
            const isCorrect = answer.id === result.correct_answer_id;
            const showCorrect = isCorrect && !result.is_correct;

            let bgColor = colors.background;
            let borderColor = colors.border;
            let textColor = colors.textSecondary;
            let fontWeight: 'normal' | '600' = 'normal';
            let prefix = '';

            if (isChoice && result.is_correct) {
              bgColor = colors.successBg;
              borderColor = colors.successBorder;
              textColor = colors.success;
              fontWeight = '600';
              prefix = '✓  ';
            } else if (isChoice && !result.is_correct) {
              bgColor = colors.errorBg;
              borderColor = colors.errorBorder;
              textColor = colors.error;
              fontWeight = '600';
              prefix = '✗  ';
            } else if (showCorrect) {
              bgColor = colors.successBg;
              borderColor = colors.successBorder;
              textColor = colors.success;
              fontWeight = '600';
              prefix = '✓  ';
            }

            return (
              <View 
                key={answer.id} 
                style={[styles.answer, { backgroundColor: bgColor, borderColor }]}
              >
                <Text style={[styles.answerText, { color: textColor, fontWeight }]}>
                  {prefix}{answer.description}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.xl,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    marginHorizontal: 16,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 14,
  },
  answersWrap: {
    gap: 6,
  },
  answer: {
    borderWidth: 1.5,
    borderRadius: Radii.md,
    padding: 12,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  pendingBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.md,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  pendingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  commentBox: {
    borderRadius: Radii.md,
    padding: 12,
    borderWidth: 1,
  },
  commentLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 21,
  },
});
