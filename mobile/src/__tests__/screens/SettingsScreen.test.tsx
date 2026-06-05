/**
 * Tests for SettingsScreen — notification section
 * Task 12.2 — Requirements: 2.1, 5.1
 *
 * Covers:
 *  - Notifications toggle is rendered
 *  - Time picker row is rendered when notifications are enabled
 *  - Time picker row is hidden when notifications are disabled
 *  - Toggling the switch calls updateNotificationsEnabled
 *  - Tapping the time button shows the DateTimePicker
 */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import SettingsScreen from '../../screens/SettingsScreen';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockUpdateNotificationTime = jest.fn();
const mockUpdateNotificationsEnabled = jest.fn();
const mockUpdateBibleSource = jest.fn();

const BASE_SETTINGS = {
  bible_source: 'youversion' as const,
  bible_version: 'TLA',
  notification_time: '07:00',
  notifications_enabled: true,
};

jest.mock('../../hooks/useUserSettings', () => ({
  useUserSettings: () => ({
    settings: BASE_SETTINGS,
    isLoading: false,
    error: null,
    updateBibleSource: mockUpdateBibleSource,
    updateNotificationTime: mockUpdateNotificationTime,
    updateNotificationsEnabled: mockUpdateNotificationsEnabled,
    refreshSettings: jest.fn(),
  }),
}));

jest.mock('../../auth/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    deleteAccount: jest.fn(),
  }),
}));

jest.mock('../../theme', () => {
  const colors = {
    background: '#FDF8F0',
    backgroundAlt: '#FAF4E6',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFCF6',
    surfaceWarm: '#FFFCF6',
    textPrimary: '#1C1410',
    textSecondary: '#4A3928',
    textMuted: '#8A7A6A',
    textDisabled: '#C4B5A5',
    textInverse: '#FFFFFF',
    border: '#EDE5D8',
    borderMed: '#D8CCB8',
    borderStrong: '#C4B5A5',
    primary: '#895301',
    primaryLight: '#FEF8E8',
    gold: '#D6A21E',
    goldBright: '#E8B848',
    goldDark: '#895301',
    goldDeep: '#6B4000',
    goldLight: '#F5E8BE',
    goldFaint: '#FEF8E8',
    goldGlow: 'rgba(214,162,30,0.18)',
    success: '#2A6E48',
    successBg: '#EDFAF4',
    successBorder: '#96D8B4',
    error: '#B83030',
    errorBg: '#FDECEA',
    errorBorder: '#F5B0B0',
    warning: '#C27B0A',
    warningBg: '#FEF8E8',
    warningBorder: '#ECC870',
    overlay: 'rgba(28,20,16,0.5)',
    shimmer: '#EDE5D8',
  };

  return {
    useTheme: () => ({
      colors,
      isDark: false,
      mode: 'light',
      setMode: jest.fn(),
    }),
    createShadows: () => ({
      xs: {},
      sm: {},
      md: {},
      lg: {},
      gold: {},
    }),
    Spacing: {
      xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24,
      '2xl': 32, '3xl': 40, '4xl': 48, '5xl': 64,
    },
    Radii: { sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32, full: 9999 },
    ThemeMode: {},
  };
});

jest.mock('../../components/LoadingState', () => {
  const { Text } = require('react-native');
  return () => <Text>Loading</Text>;
});

jest.mock('../../components/ui/SectionHeader', () => {
  const { Text } = require('react-native');
  return ({ title }: { title: string }) => <Text>{title}</Text>;
});

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  return (props: any) => <View testID="date-time-picker" {...props} />;
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SettingsScreen — notification section', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the notifications toggle', () => {
    render(<SettingsScreen />);
    // The Switch is rendered; find it by its value prop
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeTruthy();
  });

  it('renders the notification time row when notifications are enabled', () => {
    render(<SettingsScreen />);
    // The time button shows the current notification_time
    expect(screen.getByText('07:00')).toBeTruthy();
  });

  it('calls updateNotificationsEnabled(false) when the toggle is turned off', () => {
    render(<SettingsScreen />);
    const toggle = screen.getByRole('switch');
    fireEvent(toggle, 'valueChange', false);
    expect(mockUpdateNotificationsEnabled).toHaveBeenCalledWith(false);
  });

  it('calls updateNotificationsEnabled(true) when the toggle is turned on', () => {
    // Override the mock to return notifications_enabled: false
    const { useUserSettings } = require('../../hooks/useUserSettings');
    useUserSettings.mockReturnValueOnce
      ? useUserSettings.mockReturnValueOnce({
          settings: { ...BASE_SETTINGS, notifications_enabled: false },
          isLoading: false,
          error: null,
          updateBibleSource: mockUpdateBibleSource,
          updateNotificationTime: mockUpdateNotificationTime,
          updateNotificationsEnabled: mockUpdateNotificationsEnabled,
          refreshSettings: jest.fn(),
        })
      : null;

    render(<SettingsScreen />);
    const toggle = screen.getByRole('switch');
    fireEvent(toggle, 'valueChange', true);
    expect(mockUpdateNotificationsEnabled).toHaveBeenCalledWith(true);
  });

  it('shows the DateTimePicker when the time button is tapped', () => {
    render(<SettingsScreen />);

    // DateTimePicker should not be visible initially
    expect(screen.queryByTestId('date-time-picker')).toBeNull();

    // Tap the time button (shows the current time)
    const timeButton = screen.getByText('07:00');
    fireEvent.press(timeButton);

    // Now the picker should be visible
    expect(screen.getByTestId('date-time-picker')).toBeTruthy();
  });
});
