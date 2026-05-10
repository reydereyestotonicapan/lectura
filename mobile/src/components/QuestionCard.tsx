import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Question } from '../types/api';

interface Props {
  question: Question;
  selectedAnswerId: number | undefined;
  commentText: string | undefined;
  onSelect: (answerId: number) => void;
  onCommentChange: (text: string) => void;
}

export default function QuestionCard({ 
  question, 
  selectedAnswerId, 
  commentText,
  onSelect,
  onCommentChange,
}: Props) {
  const isOpenQuestion = question.answers.length === 0;

  return (
    <View style={styles.card}>
      <Text style={styles.questionText}>{question.description}</Text>
      
      {isOpenQuestion ? (
        <View>
          <TextInput
            style={styles.textArea}
            placeholder="Escribe tu respuesta aquí..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={commentText ?? ''}
            onChangeText={onCommentChange}
          />
          <Text style={styles.hint}>Pregunta abierta - será revisada por el equipo</Text>
        </View>
      ) : (
        question.answers.map((answer) => {
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
  textArea: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    minHeight: 100,
    backgroundColor: '#f9fafb',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
