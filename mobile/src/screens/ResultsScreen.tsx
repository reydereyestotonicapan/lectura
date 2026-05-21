import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Radii, Spacing } from '../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TodayStackParamList } from '../navigation/types';
import ResultItem from '../components/ResultItem';
import AnimatedFade from '../components/ui/AnimatedFade';

type Props = NativeStackScreenProps<TodayStackParamList, 'Results'>;

function ScoreLabel({ score, total }: { score: number; total: number }) {
  const pct = total > 0 ? score / total : 0;
  if (pct === 1) return { emoji: '🏆', msg: '¡Perfecto! Excelente trabajo.' };
  if (pct >= 0.7) return { emoji: '⭐', msg: '¡Muy bien! Sigue así.' };
  if (pct >= 0.4) return { emoji: '📖', msg: 'Buen intento. La práctica hace al maestro.' };
  return { emoji: '💪', msg: 'Ánimo. Cada día aprendes más.' };
}

export default function ResultsScreen({ route, navigation }: Props) {
  const { colors, gradients } = useTheme();
  const { score, total, results, questions } = route.params;
  const { emoji, msg } = ScoreLabel({ score, total });
  const pct = total > 0 ? score / total : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={results}
        keyExtractor={(r) => String(r.question_id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <AnimatedFade>
            {/* Score hero */}
            <LinearGradient
              colors={pct >= 0.7 ? gradients.gold : gradients.goldDeep}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <Text style={styles.heroEmoji}>{emoji}</Text>
              <Text style={styles.heroScore}>
                {score}
                <Text style={styles.heroTotal}> / {total}</Text>
              </Text>
              <Text style={styles.heroLabel}>correctas</Text>
              <Text style={styles.heroMsg}>{msg}</Text>

              {/* Score bar */}
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, { width: `${pct * 100}%` }]} />
              </View>
            </LinearGradient>

            <Text style={[styles.detailHeader, { color: colors.textMuted }]}>Detalle de respuestas</Text>
          </AnimatedFade>
        }
        renderItem={({ item, index }) => {
          const question = questions.find((q) => q.id === item.question_id);
          if (!question) return null;
          return (
            <AnimatedFade delay={index * 50}>
              <ResultItem question={question} result={item} />
            </AnimatedFade>
          );
        }}
        ListFooterComponent={
          <AnimatedFade delay={results.length * 50 + 80}>
            <TouchableOpacity 
              style={[styles.homeBtn, { borderColor: colors.primary }]} 
              onPress={() => navigation.popToTop()} 
              activeOpacity={0.85}
            >
              <Text style={[styles.homeBtnText, { color: colors.primary }]}>Volver al inicio</Text>
            </TouchableOpacity>
          </AnimatedFade>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingBottom: 48 },

  // Hero
  hero: {
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 44, marginBottom: 12 },
  heroScore: {
    fontSize: 64,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
  },
  heroTotal: {
    fontSize: 36,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  heroMsg: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
    lineHeight: 24,
  },
  scoreBar: {
    width: '60%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 3,
  },

  detailHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 14,
    marginHorizontal: Spacing.base,
  },

  homeBtn: {
    marginHorizontal: Spacing.base,
    marginTop: 8,
    borderWidth: 1.5,
    paddingVertical: 16,
    borderRadius: Radii.xl,
    alignItems: 'center',
  },
  homeBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
