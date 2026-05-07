import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  message: string;
}

export default function EmptyState({ message }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  message: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
});
