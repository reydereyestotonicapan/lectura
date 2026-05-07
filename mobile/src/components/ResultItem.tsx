import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Question, SubmitResult } from '../types/api';

interface Props {
  question: Question;
  result: SubmitResult;
}

export default function ResultItem({ question, result }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.questionText}>{question.description}</Text>
      {question.answers.map((answer) => {
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
      })}
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
});
