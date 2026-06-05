import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Switch, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme, Radii, Spacing, createShadows, ThemeMode } from '../theme';
import { useUserSettings } from '../hooks/useUserSettings';
import { BibleSource } from '../types/chapter';
import LoadingState from '../components/LoadingState';
import SectionHeader from '../components/ui/SectionHeader';
import { useAuth } from '../auth/AuthContext';

interface BibleSourceOption {
  value: BibleSource;
  label: string;
  description: string;
  icon: string;
}

const BIBLE_SOURCES: BibleSourceOption[] = [
  {
    value: 'youversion',
    label: 'YouVersion',
    description: 'Abre los capítulos en la app YouVersion',
    icon: '📱',
  },
  {
    value: 'biblegateway',
    label: 'BibleGateway',
    description: 'Abre los capítulos en el navegador web',
    icon: '🌐',
  },
];

interface ThemeOption {
  value: ThemeMode;
  label: string;
  icon: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Claro', icon: '☀️' },
  { value: 'dark', label: 'Oscuro', icon: '🌙' },
  { value: 'system', label: 'Sistema', icon: '⚙️' },
];

export default function SettingsScreen() {
  const { colors, isDark, mode: themeMode, setMode: setThemeMode } = useTheme();
  const shadows = createShadows(isDark);
  const { settings, isLoading, error, updateBibleSource, updateNotificationTime, updateNotificationsEnabled } = useUserSettings();
  const { deleteAccount, isAuthenticated } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  if (isLoading) return <LoadingState />;

  const styles = createStyles(colors, shadows);

  /** Convert a HH:MM string to a Date object (today's date, given time) */
  const timeStringToDate = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  /** Convert a Date object to a HH:MM string */
  const dateToTimeString = (date: Date): string => {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const handleTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    // On Android the picker closes automatically; on iOS it stays open
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      updateNotificationTime(dateToTimeString(selectedDate));
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      // AuthContext.signOut() navigates automatically to login
    } catch {
      Alert.alert(
        'Error',
        'No fue posible eliminar la cuenta. Por favor, inténtalo de nuevo.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción es permanente e irreversible. Se eliminarán todos tus datos y no podrás recuperar tu cuenta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar cuenta',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Theme Selector */}
      <SectionHeader title="Apariencia" subtitle="Elige el tema de la app" style={styles.section} />

      <View style={styles.themeRow}>
        {THEME_OPTIONS.map((opt) => {
          const selected = themeMode === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.themeOption, selected && styles.themeOptionSelected]}
              onPress={() => setThemeMode(opt.value)}
              activeOpacity={0.8}
              disabled={isDeleting}
            >
              <Text style={styles.themeIcon}>{opt.icon}</Text>
              <Text style={[styles.themeLabel, selected && styles.themeLabelSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notifications */}
      <SectionHeader title="Notificaciones" subtitle="Recibe un recordatorio diario de lectura" style={styles.section} />

      <View style={styles.notifCard}>
        {/* Enable/disable toggle row */}
        <View style={styles.notifRow}>
          <View style={styles.notifRowBody}>
            <Text style={styles.notifRowLabel}>Notificaciones diarias</Text>
            <Text style={styles.notifRowDesc}>Recibe un aviso con los capítulos del día</Text>
          </View>
          <Switch
            value={settings.notifications_enabled}
            onValueChange={(enabled) => updateNotificationsEnabled(enabled)}
            trackColor={{ false: colors.border, true: colors.gold }}
            thumbColor={settings.notifications_enabled ? colors.primary : colors.textMuted}
            disabled={isDeleting}
          />
        </View>

        {/* Time picker row — only visible when notifications are enabled */}
        {settings.notifications_enabled && (
          <View style={styles.notifTimeRow}>
            <View style={styles.notifRowBody}>
              <Text style={styles.notifRowLabel}>Hora de notificación</Text>
              <Text style={styles.notifRowDesc}>
                {settings.notification_time} — toca para cambiar
              </Text>
            </View>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.8}
              disabled={isDeleting}
            >
              <Text style={styles.timeButtonText}>{settings.notification_time}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DateTimePicker — shown inline on iOS, as a dialog on Android */}
        {settings.notifications_enabled && showTimePicker && (
          <DateTimePicker
            value={timeStringToDate(settings.notification_time)}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}

        {/* On iOS, show a "Done" button to dismiss the inline spinner */}
        {settings.notifications_enabled && showTimePicker && Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.timePickerDone}
            onPress={() => setShowTimePicker(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.timePickerDoneText}>Listo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bible Source Selector */}
      <SectionHeader title="Fuente de lectura" subtitle="¿Dónde prefieres leer la Biblia?" style={styles.section} />

      {error ? (
        <View style={styles.errorBadge}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.optionsWrap}>
        {BIBLE_SOURCES.map((opt) => {
          const selected = settings.bible_source === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => opt.value !== settings.bible_source && updateBibleSource(opt.value)}
              activeOpacity={0.8}
              disabled={isDeleting}
            >
              <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
                <Text style={styles.optionEmoji}>{opt.icon}</Text>
              </View>
              <View style={styles.optionBody}>
                <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                  {opt.label}
                </Text>
                <Text style={styles.optionDesc}>{opt.description}</Text>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Sugerencia</Text>
        <Text style={styles.tipsText}>
          Si tienes la app de YouVersion instalada, te recomendamos usarla para una mejor experiencia de lectura.
        </Text>
      </View>

      {isAuthenticated && (
        <>
          <SectionHeader
            title="Zona de Peligro"
            subtitle="Acciones permanentes e irreversibles"
            style={styles.dangerSection}
          />
          <View style={styles.dangerCard}>
            <Text style={styles.dangerWarning}>
              Eliminar tu cuenta borrará permanentemente todos tus datos, incluyendo tu historial de lecturas y respuestas. Esta acción no se puede deshacer.
            </Text>
            <TouchableOpacity
              style={[styles.dangerButton, isDeleting && styles.dangerButtonDisabled]}
              onPress={handleDeleteAccount}
              disabled={isDeleting}
              activeOpacity={0.8}
            >
              {isDeleting
                ? <ActivityIndicator color={colors.textInverse} size="small" />
                : <Text style={styles.dangerButtonText}>Eliminar cuenta</Text>
              }
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors'], shadows: ReturnType<typeof createShadows>) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.base, paddingTop: Spacing.xl, paddingBottom: 48 },

    section: { marginBottom: 20, marginTop: 8 },

    // Theme selector
    themeRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 32,
    },
    themeOption: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      borderRadius: Radii.xl,
      borderWidth: 1.5,
      borderColor: colors.border,
      ...shadows.xs,
    },
    themeOptionSelected: {
      borderColor: colors.gold,
      backgroundColor: colors.goldFaint,
      ...shadows.sm,
    },
    themeIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    themeLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    themeLabelSelected: {
      color: colors.primary,
    },

    // Error
    errorBadge: {
      backgroundColor: colors.errorBg,
      borderRadius: Radii.md,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.errorBorder,
    },
    errorText: { color: colors.error, fontSize: 14 },

    // Bible source options
    optionsWrap: { gap: 10, marginBottom: 24 },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Radii.xl,
      padding: 16,
      borderWidth: 1.5,
      borderColor: colors.border,
      gap: 14,
      ...shadows.xs,
    },
    optionSelected: {
      borderColor: colors.gold,
      backgroundColor: colors.goldFaint,
      ...shadows.sm,
    },
    optionIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionIconSelected: { backgroundColor: colors.goldLight },
    optionEmoji: { fontSize: 22 },
    optionBody: { flex: 1 },
    optionLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 3,
    },
    optionLabelSelected: { color: colors.primary },
    optionDesc: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.borderMed,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioSelected: { borderColor: colors.gold },
    radioDot: {
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor: colors.gold,
    },

    // Tips
    tipsCard: {
      backgroundColor: colors.goldFaint,
      borderRadius: Radii.xl,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.goldLight,
    },
    tipsTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 6,
    },
    tipsText: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 20,
    },

    // Notifications section
    notifCard: {
      backgroundColor: colors.surface,
      borderRadius: Radii.xl,
      borderWidth: 1.5,
      borderColor: colors.border,
      marginBottom: 32,
      overflow: 'hidden',
      ...shadows.xs,
    },
    notifRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 14,
    },
    notifTimeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      paddingTop: 0,
      gap: 14,
    },
    notifRowBody: { flex: 1 },
    notifRowLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 3,
    },
    notifRowDesc: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    timeButton: {
      backgroundColor: colors.goldFaint,
      borderRadius: Radii.md,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.goldLight,
    },
    timeButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.primary,
    },
    timePickerDone: {
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    timePickerDoneText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.primary,
    },

    // Danger zone
    dangerSection: { marginBottom: 20, marginTop: 32 },
    dangerCard: {
      backgroundColor: colors.errorBg,
      borderRadius: Radii.xl,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.errorBorder,
      gap: 16,
    },
    dangerWarning: {
      fontSize: 13,
      color: colors.error,
      lineHeight: 20,
    },
    dangerButton: {
      backgroundColor: colors.error,
      borderRadius: Radii.lg,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    dangerButtonDisabled: { opacity: 0.6 },
    dangerButtonText: {
      color: colors.textInverse,
      fontSize: 15,
      fontWeight: '700',
    },
  });
