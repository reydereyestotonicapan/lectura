import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { useAuth } from '../auth/AuthContext';
import { useTheme, Radii, createShadows } from '../theme';
import { register } from '../api/auth';
import { AuthStackParamList } from '../navigation/types';

type Props = StackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { colors, gradients, isDark } = useTheme();
  const shadows = createShadows(isDark);
  const { signIn } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    if (!name.trim()) { setError('Por favor ingresa tu nombre'); return; }
    if (!email.trim()) { setError('Por favor ingresa tu correo electrónico'); return; }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (password !== passwordConfirm) { setError('Las contraseñas no coinciden'); return; }

    setIsLoading(true);
    setError(null);
    try {
      const { token, user } = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirm,
      });
      await signIn(token, user);
    } catch (err: any) {
      if (err.response?.status === 422) {
        const errors = err.response.data?.errors;
        if (errors?.email) setError('Este correo ya está registrado');
        else if (errors?.password) setError('La contraseña debe tener al menos 8 caracteres');
        else setError('Por favor verifica tus datos');
      } else {
        setError('Error de conexión. Inténtalo de nuevo.');
      }
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
        {/* Header */}
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.backLabel}>Iniciar sesión</Text>
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Crear cuenta</Text>
          <Text style={styles.heroSub}>Únete al ministerio de lectura</Text>
        </LinearGradient>

        {/* Form sheet */}
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>

          {/* Name */}
          <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: nameFocused ? colors.gold : colors.border }, nameFocused && shadows.xs]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Nombre completo"
              placeholderTextColor={colors.textDisabled}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => emailRef.current?.focus()}
              value={name}
              onChangeText={setName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
          </View>

          {/* Email */}
          <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: emailFocused ? colors.gold : colors.border }, emailFocused && shadows.xs]}>
            <TextInput
              ref={emailRef}
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

          {/* Password */}
          <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: passwordFocused ? colors.gold : colors.border }, passwordFocused && shadows.xs]}>
            <TextInput
              ref={passwordRef}
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Contraseña (mín. 8 caracteres)"
              placeholderTextColor={colors.textDisabled}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => confirmRef.current?.focus()}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>

          {/* Confirm password */}
          <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: confirmFocused ? colors.gold : colors.border }, confirmFocused && shadows.xs]}>
            <TextInput
              ref={confirmRef}
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Confirmar contraseña"
              placeholderTextColor={colors.textDisabled}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              onFocus={() => setConfirmFocused(true)}
              onBlur={() => setConfirmFocused(false)}
            />
          </View>

          {error ? (
            <View style={[styles.errorBadge, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryBtn, shadows.gold, isLoading && styles.btnDisabled]}
            onPress={handleRegister}
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
                <Text style={styles.primaryText}>Crear cuenta</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginWrap} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={[styles.loginText, { color: colors.textMuted }]}>
              ¿Ya tienes cuenta?{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Iniciar sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: {
    paddingTop: 60,
    paddingBottom: 36,
    paddingHorizontal: 28,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 4,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 28,
    color: 'rgba(255,252,240,0.9)',
    lineHeight: 30,
    fontWeight: '300',
  },
  backLabel: {
    fontSize: 15,
    color: 'rgba(255,252,240,0.9)',
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFCF0',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 15,
    color: 'rgba(255,252,240,0.75)',
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 28,
    paddingTop: 32,
  },
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
  loginWrap: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loginText: {
    fontSize: 14,
  },
});
