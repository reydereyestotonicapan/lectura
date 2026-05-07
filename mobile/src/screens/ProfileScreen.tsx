import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import client from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { ApiUser } from '../types/api';

export default function ProfileScreen() {
  const { signOut, user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(!user);

  useEffect(() => {
    if (user) return;
    client.get('/profile').then(({ data }) => {
      setUser(data as ApiUser);
    }).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, alignItems: 'center', padding: 32, paddingTop: 64 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  email: { fontSize: 14, color: '#6b7280', marginBottom: 48 },
  button: {
    borderWidth: 1.5,
    borderColor: '#ef4444',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
});
