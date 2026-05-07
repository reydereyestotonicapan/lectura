import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Question } from '../types/api';

interface Props {
  question: Question;
  selectedAnswerId: number | undefined;
  onSelect: (answerId: number) => void;
}

export default function QuestionCard({ question, selectedAnswerId, onSelect }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.questionText}>{question.description}</Text>
      {question.answers.map((answer) => {
        const selected = selectedAnswerId === answer.id;
        return (
          <TouchableOpacity
            key={answer.id}
            style={[styles.option, selected && styles.optionSelected]}
            onPress={() => onSelect(answer.id)}
          >
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
              {answer.description}
            </Text>
          </TouchableOpacity>
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
  questionText: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  option: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  optionSelected: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
  optionText: { fontSize: 14, color: '#374151' },
  optionTextSelected: { color: '#4338ca', fontWeight: '600' },
});
