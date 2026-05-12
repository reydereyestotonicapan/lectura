import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Question, SubmitResult } from '../types/api';

interface Props {
  question: Question;
  result: SubmitResult;
}

export default function ResultItem({ question, result }: Props) {
  const isOpenQuestion = result.is_open_question;

  return (
    <View style={styles.card}>
      <Text style={styles.questionText}>{question.description}</Text>
      
      {isOpenQuestion ? (
        <View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pendiente de revisión</Text>
          </View>
          <View style={styles.commentBox}>
            <Text style={styles.commentLabel}>Tu respuesta:</Text>
            <Text style={styles.commentText}>{result.comment_user}</Text>
          </View>
        </View>
      ) : (
        question.answers.map((answer) => {
          const isUserChoice = answer.id === result.answer_id;
          const isCorrect = answer.id === result.correct_answer_id;

          let rowStyle = styles.answer;
          let textStyle = styles.answerText;

          if (isUserChoice && result.is_correct) {
            rowStyle = { ...styles.answer, ...styles.correct };
            textStyle = { ...styles.answerText, ...styles.correctText };
          } else if (isUserChoice && !result.is_correct) {
            rowStyle = { ...styles.answer, ...styles.wrong };
            textStyle = { ...styles.answerText, ...styles.wrongText };
          } else if (isCorrect && !result.is_correct) {
            rowStyle = { ...styles.answer, ...styles.correct };
            textStyle = { ...styles.answerText, ...styles.correctText };
          }

          return (
            <View key={answer.id} style={rowStyle}>
              <Text style={textStyle}>{answer.description}</Text>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  questionText: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 12 },
  answer: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  correct: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  wrong: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  answerText: { fontSize: 14, color: '#374151' },
  correctText: { color: '#15803d', fontWeight: '600' },
  wrongText: { color: '#b91c1c', fontWeight: '600' },
  pendingBadge: {
    backgroundColor: '#fef9c3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  pendingText: {
    color: '#ca8a04',
    fontSize: 12,
    fontWeight: '600',
  },
  commentBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  commentLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
