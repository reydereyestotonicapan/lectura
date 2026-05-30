import { useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings } from '../api/settings';
import { UserSettings, BibleSource } from '../types/chapter';

/**
 * Return type for the useUserSettings hook
 */
export interface UseUserSettingsReturn {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  updateBibleSource: (source: BibleSource) => Promise<void>;
  updateNotificationTime: (time: string) => Promise<void>;
  updateNotificationsEnabled: (enabled: boolean) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

/**
 * Default settings when no user preference is set
 * Defaults to 'youversion' as per Requirements 5.3
 */
const DEFAULT_SETTINGS: UserSettings = {
  bible_source: 'youversion',
  bible_version: 'TLA',
  notification_time: '07:00',
  notifications_enabled: true,
};

/**
 * Hook for managing user Bible reading settings
 * 
 * Provides:
 * - Current user settings with loading and error states
 * - Function to update Bible source preference
 * - Function to refresh settings from server
 * 
 * @returns {UseUserSettingsReturn} Settings state and update functions
 * 
 * @example
 * ```tsx
 * const { settings, isLoading, updateBibleSource } = useUserSettings();
 * 
 * // Change Bible source
 * await updateBibleSource('biblegateway');
 * ```
 * 
 * Validates: Requirements 5.1, 5.3
 */
export function useUserSettings(): UseUserSettingsReturn {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch settings from the API
   */
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedSettings = await getSettings();
      // Merge with defaults in case some fields are missing
      setSettings({
        ...DEFAULT_SETTINGS,
        ...fetchedSettings,
      });
    } catch (err) {
      setError('No se pudieron cargar las preferencias.');
      // Keep default settings on error
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh settings from the server
   */
  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  /**
   * Update the user's Bible source preference
   * 
   * @param source - The new Bible source ('youversion' or 'biblegateway')
   */
  const updateBibleSource = useCallback(async (source: BibleSource) => {
    const previousSettings = settings;
    
    // Optimistic update
    setSettings(prev => ({
      ...prev,
      bible_source: source,
    }));
    setError(null);
    
    try {
      const updatedSettings = await updateSettings({ bible_source: source });
      // Update with server response to ensure consistency
      setSettings({
        ...DEFAULT_SETTINGS,
        ...updatedSettings,
      });
    } catch (err) {
      // Rollback on error
      setSettings(previousSettings);
      setError('No se pudo guardar la preferencia. Intenta de nuevo.');
      throw err;
    }
  }, [settings]);

  /**
   * Update the user's notification time preference
   * 
   * @param time - The new notification time in HH:MM 24-hour format
   */
  const updateNotificationTime = useCallback(async (time: string) => {
    const previous = settings;

    // Optimistic update
    setSettings(prev => ({ ...prev, notification_time: time }));
    setError(null);

    try {
      const updated = await updateSettings({ notification_time: time });
      setSettings({ ...DEFAULT_SETTINGS, ...updated });
    } catch (err) {
      // Rollback on error
      setSettings(previous);
      setError('No se pudo guardar la hora. Intenta de nuevo.');
      throw err;
    }
  }, [settings]);

  /**
   * Update the user's notifications enabled preference
   * 
   * @param enabled - Whether daily reading notifications should be enabled
   */
  const updateNotificationsEnabled = useCallback(async (enabled: boolean) => {
    const previous = settings;

    // Optimistic update
    setSettings(prev => ({ ...prev, notifications_enabled: enabled }));
    setError(null);

    try {
      const updated = await updateSettings({ notifications_enabled: enabled });
      setSettings({ ...DEFAULT_SETTINGS, ...updated });
    } catch (err) {
      // Rollback on error
      setSettings(previous);
      setError('No se pudo guardar la preferencia. Intenta de nuevo.');
      throw err;
    }
  }, [settings]);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    updateBibleSource,
    updateNotificationTime,
    updateNotificationsEnabled,
    refreshSettings,
  };
}

export default useUserSettings;
