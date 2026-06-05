import React, { useState } from 'react';
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
import { useTheme, Radii, createShadows } from '../theme';
import { forgotPassword } from '../api/auth';
import { AuthStackParamList } from '../navigation/types';

type Props = StackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { colors, gradients, isDark } = useTheme();
  const shadows = createShadows(isDark);

  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Por favor ingresa tu correo electrónico'); return; }

    setIsLoading(true);
    setError(null);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
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
          <Text style={styles.heroTitle}>¿Olvidó su{'\n'}contraseña?</Text>
          <Text style={styles.heroSub}>Le enviaremos un enlace para restablecerla</Text>
        </LinearGradient>

        {/* Form sheet */}
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          {sent ? (
            <View style={styles.successWrap}>
              <View style={[styles.successIcon, { backgroundColor: colors.goldFaint, borderColor: colors.goldLight }]}>
                <Text style={styles.successEmoji}>✉️</Text>
              </View>
              <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Correo enviado</Text>
              <Text style={[styles.successBody, { color: colors.textMuted }]}>
                Si el correo <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{email}</Text> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </Text>
              <Text style={[styles.successNote, { color: colors.textDisabled }]}>
                Revisa también tu carpeta de spam.
              </Text>
              <TouchableOpacity
                style={[styles.primaryBtn, shadows.gold, { marginTop: 32 }]}
                onPress={() => navigation.goBack()}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={gradients.gold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryGradient}
                >
                  <Text style={styles.primaryText}>Volver al inicio de sesión</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={[styles.instructions, { color: colors.textMuted }]}>
                Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
              </Text>

              <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: emailFocused ? colors.gold : colors.border }, emailFocused && shadows.xs]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Correo electrónico"
                  placeholderTextColor={colors.textDisabled}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="send"
                  onSubmitEditing={handleSubmit}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>

              {error ? (
                <View style={[styles.errorBadge, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.primaryBtn, shadows.gold, isLoading && styles.btnDisabled]}
                onPress={handleSubmit}
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
                    <Text style={styles.primaryText}>Enviar enlace</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
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
  instructions: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
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

  // Success state
  successWrap: {
    alignItems: 'center',
    paddingTop: 16,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successEmoji: { fontSize: 32 },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  successBody: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  successNote: {
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});
