import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useAuth } from '../auth/AuthContext';
import { Colors } from '../theme';
import { emailLogin, firebaseLogin } from '../api/auth';
import { firebaseAuth } from '../firebase';

let GoogleSignin: any = null;
let statusCodes: any = {};

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';

try {
  const googleSignIn = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSignIn.GoogleSignin;
  statusCodes = googleSignIn.statusCodes;
  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
} catch (e) {
  // Running in Expo Go
}

export default function LoginScreen() {
  const { signIn, enterGuestMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { token, user } = await emailLogin({ email, password });
      await signIn(token, user);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Correo o contraseña incorrectos');
      } else if (err.response?.status === 422) {
        setError('Por favor verifica tus datos');
      } else {
        setError('Error de conexión. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!GoogleSignin) {
      Alert.alert('No disponible', 'Google Sign-In requiere un build de desarrollo.');
      return;
    }
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) throw new Error('No id_token received');
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(firebaseAuth, googleCredential);
      const firebaseIdToken = await userCredential.user.getIdToken();
      const { token, user } = await firebaseLogin(firebaseIdToken);
      await signIn(token, user);
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Error', `Code: ${error.code}\n${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Hero section */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🍇</Text>
          <Text style={styles.heroTitle}>gRafé</Text>
          <Text style={styles.heroVerse}>
            "Yo soy la vid, ustedes{'\n'}son las ramas."
          </Text>
          <Text style={styles.heroRef}>— Juan 15:5</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inicia sesión</Text>

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleEmailLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Guest separator */}
          <View style={styles.guestSeparator}>
            <View style={styles.dividerLine} />
          </View>

          {/* Guest option */}
          <TouchableOpacity style={styles.guestButton} onPress={enterGuestMode}>
            <View style={styles.guestButtonInner}>
              <Text style={styles.guestIcon}>👁</Text>
              <View>
                <Text style={styles.guestButtonText}>Explorar como invitado</Text>
                <Text style={styles.guestButtonSub}>
                  Ve la lectura y preguntas de hoy · Sin cuenta
                </Text>
              </View>
            </View>
            <Text style={styles.guestArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scroll: {
    flexGrow: 1,
  },

  // Hero
  hero: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: 1,
  },
  heroVerse: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  heroRef: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Card
  card: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingTop: 28,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 24,
  },

  // Inputs
  input: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },

  // Buttons
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    color: Colors.textMuted,
    paddingHorizontal: 16,
    fontSize: 14,
  },

  // Google
  googleButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  googleButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Guest
  guestSeparator: {
    marginTop: 28,
    marginBottom: 16,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 16,
  },
  guestButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  guestIcon: {
    fontSize: 22,
  },
  guestButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  guestButtonSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  guestArrow: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: '300',
  },
});
