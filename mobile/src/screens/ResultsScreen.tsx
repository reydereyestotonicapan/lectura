import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TodayStackParamList } from '../navigation/types';
import ResultItem from '../components/ResultItem';

type Props = NativeStackScreenProps<TodayStackParamList, 'Results'>;

export default function ResultsScreen({ route, navigation }: Props) {
  const { score, total, results, questions } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreText}>
          {score} de {total} correctas
        </Text>
      </View>
      <FlatList
        data={results}
        keyExtractor={(r) => String(r.question_id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const question = questions.find((q) => q.id === item.question_id);
          if (!question) return null;
          return <ResultItem question={question} result={item} />;
        }}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Today')}
          >
            <Text style={styles.buttonText}>Volver a inicio</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scoreHeader: {
    backgroundColor: '#6366f1',
    padding: 24,
    alignItems: 'center',
  },
  scoreText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 32 },
  button: {
    borderWidth: 1.5,
    borderColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#6366f1', fontSize: 16, fontWeight: '600' },
});
