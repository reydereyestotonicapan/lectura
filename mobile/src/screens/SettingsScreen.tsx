import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme';
import { useUserSettings } from '../hooks/useUserSettings';
import { BibleSource } from '../types/chapter';

interface BibleSourceOption {
  value: BibleSource;
  label: string;
  description: string;
}

const BIBLE_SOURCE_OPTIONS: BibleSourceOption[] = [
  {
    value: 'youversion',
    label: 'YouVersion (App)',
    description: 'Abre los capítulos en la aplicación YouVersion',
  },
  {
    value: 'biblegateway',
    label: 'BibleGateway (Web)',
    description: 'Abre los capítulos en el navegador web',
  },
];

/**
 * Settings screen for user preferences
 * 
 * Allows users to configure their Bible reading source preference.
 * 
 * Validates: Requirements 5.1, 5.2
 */
export default function SettingsScreen() {
  const { settings, isLoading, error, updateBibleSource } = useUserSettings();

  const handleSourceChange = async (source: BibleSource) => {
    if (source === settings.bible_source) return;
    
    try {
      await updateBibleSource(source);
    } catch {
      // Error is handled by the hook and displayed via the error state
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fuente de lectura</Text>
        <Text style={styles.sectionDescription}>
          Selecciona dónde prefieres leer los capítulos de la Biblia
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.optionsContainer}>
          {BIBLE_SOURCE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionCard,
                settings.bible_source === option.value && styles.optionCardSelected,
              ]}
              onPress={() => handleSourceChange(option.value)}
              activeOpacity={0.7}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    settings.bible_source === option.value && styles.radioOuterSelected,
                  ]}
                >
                  {settings.bible_source === option.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionLabel,
                      settings.bible_source === option.value && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: Colors.primary,
  },
  optionDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
