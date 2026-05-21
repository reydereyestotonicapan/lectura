import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Animated } from 'react-native';
import { useTheme, Radii, createShadows } from '../theme';
import { Question } from '../types/api';

interface Props {
  question: Question;
  questionIndex?: number;
  selectedAnswerId: number | undefined;
  commentText: string | undefined;
  onSelect: (answerId: number) => void;
  onCommentChange: (text: string) => void;
}

function OptionButton({ answer, selected, onSelect }: {
  answer: Question['answers'][number];
  selected: boolean;
  onSelect: () => void;
}) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.option, 
          { borderColor: colors.border, backgroundColor: colors.background },
          selected && { borderColor: colors.gold, backgroundColor: colors.goldFaint }
        ]}
        onPress={onSelect}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
      >
        <View style={[
          styles.optionDot, 
          { borderColor: colors.borderMed, backgroundColor: colors.surface },
          selected && { borderColor: colors.gold }
        ]}>
          {selected && <View style={[styles.optionDotInner, { backgroundColor: colors.gold }]} />}
        </View>
        <Text style={[
          styles.optionText, 
          { color: colors.textSecondary },
          selected && { color: colors.primary, fontWeight: '600' }
        ]}>
          {answer.description}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function QuestionCard({
  question,
  questionIndex,
  selectedAnswerId,
  commentText,
  onSelect,
  onCommentChange,
}: Props) {
  const { colors, isDark } = useTheme();
  const shadows = createShadows(isDark);
  const isOpen = question.answers.length === 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}>
      {questionIndex !== undefined && (
        <Text style={[styles.index, { color: colors.gold }]}>Pregunta {questionIndex + 1}</Text>
      )}
      <Text style={[styles.questionText, { color: colors.textPrimary }]}>{question.description}</Text>

      {isOpen ? (
        <View>
          <TextInput
            style={[styles.textArea, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.background }]}
            placeholder="Escribe tu respuesta aquí..."
            placeholderTextColor={colors.textDisabled}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={commentText ?? ''}
            onChangeText={onCommentChange}
          />
          <Text style={[styles.hint, { color: colors.textMuted }]}>✍️  Pregunta abierta — el equipo revisará tu respuesta</Text>
        </View>
      ) : (
        <View style={styles.optionsList}>
          {question.answers.map((answer) => (
            <OptionButton
              key={answer.id}
              answer={answer}
              selected={selectedAnswerId === answer.id}
              onSelect={() => onSelect(answer.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.xl,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  index: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 16,
  },
  optionsList: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  optionDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: Radii.lg,
    padding: 14,
    fontSize: 15,
    minHeight: 110,
    lineHeight: 22,
  },
  hint: {
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
  },
});
