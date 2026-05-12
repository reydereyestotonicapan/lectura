import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { firebaseLogin } from '../api/auth';

// Lazy load Google Sign-In to avoid crashes in Expo Go
let GoogleSignin: any = null;
let statusCodes: any = {};

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';

// Only configure if running in a dev build (not Expo Go)
try {
  const googleSignIn = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSignIn.GoogleSignin;
  statusCodes = googleSignIn.statusCodes;
  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
} catch (e) {
  console.log('Google Sign-In not available (running in Expo Go)');
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!GoogleSignin) {
      Alert.alert(
        'No disponible',
        'Google Sign-In requiere un build de desarrollo. Usa SKIP_AUTH en AuthContext para pruebas.'
      );
      return;
    }

    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) throw new Error('No id_token received');

      const { token, user } = await firebaseLogin(idToken);
      await signIn(token, user);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled — do nothing
      } else {
        Alert.alert('Error', 'No se pudo iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lectura Diaria</Text>
      <Text style={styles.subtitle}>Lecturas bíblicas y quizzes diarios</Text>

      <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar sesión con Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6b7280', marginBottom: 48, textAlign: 'center' },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
