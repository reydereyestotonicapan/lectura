import React, { useState, useRef, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential } from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { generateNonce } from '../utils/generateNonce';
import { useAuth } from '../auth/AuthContext';
import { useTheme, Radii, createShadows } from '../theme';
import { emailLogin, firebaseLogin } from '../api/auth';
import { firebaseAuth } from '../firebase';
import { AuthStackParamList } from '../navigation/types';

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

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

export default function LoginScreen({ navigation }: Props) {
  const { colors, gradients, isDark } = useTheme();
  const shadows = createShadows(isDark);
  const { signIn, enterGuestMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

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
      if (err.response?.status === 401) setError('Correo o contraseña incorrectos');
      else if (err.response?.status === 422) setError('Por favor verifica tus datos');
      else setError('Error de conexión. Inténtalo de nuevo.');
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
      if (!idToken) return;
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(firebaseAuth, googleCredential);
      const firebaseIdToken = await userCredential.user.getIdToken();
      const { token, user } = await firebaseLogin(firebaseIdToken);
      await signIn(token, user);
    } catch (err: any) {
      if (err.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Error', 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const { rawNonce, hashedNonce } = await generateNonce();

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!appleCredential.identityToken) {
        Alert.alert('Error', 'No se pudo iniciar sesión con Apple. Inténtalo de nuevo.');
        return;
      }

      const oauthCredential = new OAuthProvider('apple.com').credential({
        idToken: appleCredential.identityToken,
        rawNonce,
      });

      const userCredential = await signInWithCredential(firebaseAuth, oauthCredential);
      const firebaseIdToken = await userCredential.user.getIdToken();
      const { token, user } = await firebaseLogin(firebaseIdToken);
      await signIn(token, user);
    } catch (err: any) {
      if (err.code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      Alert.alert('Error', 'No se pudo iniciar sesión con Apple. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.goldDeep }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={Platform.OS === 'ios'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* Hero gradient section */}
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <Image
            source={require('../../assets/app-icon.png')}
            style={styles.heroIcon}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>gRafé</Text>
          <View style={styles.verseCard}>
            <Text style={styles.verseText}>
              "Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir, para instruir en justicia."
            </Text>
            <Text style={styles.verseRef}>— 2 Timoteo 3:16</Text>
          </View>
        </LinearGradient>

        {/* Form sheet */}
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Iniciar sesión</Text>

          {/* Email input */}
          <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: emailFocused ? colors.gold : colors.border }, emailFocused && shadows.xs]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Correo electrónico"
              placeholderTextColor={colors.textDisabled}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          {/* Password input */}
          <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: passwordFocused ? colors.gold : colors.border }, passwordFocused && shadows.xs]}>
            <TextInput
              ref={passwordRef}
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Contraseña"
              placeholderTextColor={colors.textDisabled}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleEmailLogin}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>

          {/* Forgot password */}
          <TouchableOpacity
            style={styles.forgotWrap}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.7}
          >
            <Text style={[styles.forgotText, { color: colors.primary }]}>¿Ha olvidado su contraseña?</Text>
          </TouchableOpacity>

          {error ? (
            <View style={[styles.errorBadge, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          {/* Primary login button */}
          <TouchableOpacity
            style={[styles.primaryBtn, shadows.gold, isLoading && styles.btnDisabled]}
            onPress={handleEmailLogin}
            disabled={isLoading}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={isLoading ? [colors.textDisabled, colors.borderMed] : gradients.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>Iniciar sesión</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Create account link */}
          <TouchableOpacity
            style={styles.registerWrap}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}
          >
            <Text style={[styles.registerText, { color: colors.textMuted }]}>
              ¿No tienes cuenta?{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Abrir una cuenta</Text>
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textDisabled }]}>o continúa con</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={[styles.googleBtn, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.xs, isLoading && styles.btnDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={[styles.googleText, { color: colors.textPrimary }]}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Apple */}
          {appleAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={Radii.lg}
              style={styles.appleBtn}
              onPress={handleAppleSignIn}
            />
          )}

          {/* Guest option */}
          <View style={[styles.guestSep, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={[styles.guestBtn, { backgroundColor: colors.goldFaint, borderColor: colors.goldLight }]} onPress={enterGuestMode} activeOpacity={0.8}>
            <View style={styles.guestLeft}>
              <Text style={styles.guestIcon}>👁</Text>
              <View>
                <Text style={[styles.guestTitle, { color: colors.primary }]}>Explorar como invitado</Text>
                <Text style={[styles.guestSub, { color: colors.textMuted }]}>Ve la lectura y preguntas de hoy · Sin cuenta</Text>
              </View>
            </View>
            <Text style={[styles.guestArrow, { color: colors.primary }]}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: { flexGrow: 1 },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 44,
    paddingHorizontal: 32,
  },
  heroIcon: {
    width: 80,
    height: 80,
    marginBottom: 12,
    borderRadius: 20,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFCF0',
    marginBottom: 24,
    letterSpacing: -1,
  },
  verseCard: {
    backgroundColor: 'rgba(255,252,240,0.12)',
    borderRadius: Radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,252,240,0.2)',
    maxWidth: 300,
  },
  verseText: {
    fontSize: 14,
    color: 'rgba(255,252,240,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  verseRef: {
    fontSize: 12,
    color: 'rgba(255,252,240,0.6)',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Sheet
  sheet: {
    flex: 1,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 28,
    paddingTop: 32,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: -0.4,
  },

  // Inputs
  inputWrap: {
    borderWidth: 1.5,
    borderRadius: Radii.lg,
    marginBottom: 12,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
  },
  errorBadge: {
    borderRadius: Radii.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },

  // Forgot / Register links
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 4,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  registerWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  registerText: {
    fontSize: 14,
  },

  // Primary button
  primaryBtn: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
    marginTop: 4,
  },
  primaryGradient: {
    paddingVertical: 17,
    alignItems: 'center',
    borderRadius: Radii.lg,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  btnDisabled: { opacity: 0.6 },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },

  // Google
  googleBtn: {
    borderWidth: 1.5,
    paddingVertical: 15,
    borderRadius: Radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Apple
  appleBtn: {
    width: '100%',
    height: 50,
    marginTop: 12,
  },

  // Guest
  guestSep: { height: 1, marginVertical: 20 },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radii.xl,
    padding: 16,
    borderWidth: 1,
  },
  guestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  guestIcon: { fontSize: 22 },
  guestTitle: { fontSize: 15, fontWeight: '700' },
  guestSub: { fontSize: 12, marginTop: 2 },
  guestArrow: { fontSize: 24, fontWeight: '300' },
});
