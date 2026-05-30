/**
 * Tests for useUserSettings — notification helpers
 * Task 11.4 — Requirements: 2.2, 5.2
 *
 * Covers:
 *  - updateNotificationTime: optimistic update + rollback on error
 *  - updateNotificationsEnabled: optimistic update + rollback on error
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUserSettings } from '../../hooks/useUserSettings';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockGetSettings = jest.fn();
const mockUpdateSettings = jest.fn();

jest.mock('../../api/settings', () => ({
  getSettings: () => mockGetSettings(),
  updateSettings: (s: unknown) => mockUpdateSettings(s),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const BASE_SETTINGS = {
  bible_source: 'youversion' as const,
  bible_version: 'TLA',
  notification_time: '07:00',
  notifications_enabled: true,
};

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSettings.mockResolvedValue(BASE_SETTINGS);
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useUserSettings — updateNotificationTime', () => {
  it('applies an optimistic update immediately before the API resolves', async () => {
    let resolveUpdate!: (v: typeof BASE_SETTINGS) => void;
    mockUpdateSettings.mockReturnValue(
      new Promise<typeof BASE_SETTINGS>((res) => { resolveUpdate = res; }),
    );

    const { result } = renderHook(() => useUserSettings());

    // Wait for initial fetch
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateNotificationTime('09:30');
    });

    // Optimistic value should be visible immediately
    expect(result.current.settings.notification_time).toBe('09:30');

    // Resolve the API call
    await act(async () => {
      resolveUpdate({ ...BASE_SETTINGS, notification_time: '09:30' });
    });

    expect(result.current.settings.notification_time).toBe('09:30');
  });

  it('rolls back to the previous value when the API call fails', async () => {
    mockUpdateSettings.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUserSettings());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      try {
        await result.current.updateNotificationTime('22:00');
      } catch {
        // expected
      }
    });

    // Should have rolled back to the original value
    expect(result.current.settings.notification_time).toBe('07:00');
    expect(result.current.error).toBe('No se pudo guardar la hora. Intenta de nuevo.');
  });

  it('calls the API with the correct notification_time payload', async () => {
    mockUpdateSettings.mockResolvedValue({ ...BASE_SETTINGS, notification_time: '08:15' });

    const { result } = renderHook(() => useUserSettings());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateNotificationTime('08:15');
    });

    expect(mockUpdateSettings).toHaveBeenCalledWith({ notification_time: '08:15' });
  });
});

describe('useUserSettings — updateNotificationsEnabled', () => {
  it('applies an optimistic update immediately before the API resolves', async () => {
    let resolveUpdate!: (v: typeof BASE_SETTINGS) => void;
    mockUpdateSettings.mockReturnValue(
      new Promise<typeof BASE_SETTINGS>((res) => { resolveUpdate = res; }),
    );

    const { result } = renderHook(() => useUserSettings());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateNotificationsEnabled(false);
    });

    // Optimistic value should be visible immediately
    expect(result.current.settings.notifications_enabled).toBe(false);

    await act(async () => {
      resolveUpdate({ ...BASE_SETTINGS, notifications_enabled: false });
    });

    expect(result.current.settings.notifications_enabled).toBe(false);
  });

  it('rolls back to the previous value when the API call fails', async () => {
    mockUpdateSettings.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUserSettings());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      try {
        await result.current.updateNotificationsEnabled(false);
      } catch {
        // expected
      }
    });

    // Should have rolled back to true
    expect(result.current.settings.notifications_enabled).toBe(true);
    expect(result.current.error).toBe('No se pudo guardar la preferencia. Intenta de nuevo.');
  });

  it('calls the API with the correct notifications_enabled payload', async () => {
    mockUpdateSettings.mockResolvedValue({ ...BASE_SETTINGS, notifications_enabled: false });

    const { result } = renderHook(() => useUserSettings());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateNotificationsEnabled(false);
    });

    expect(mockUpdateSettings).toHaveBeenCalledWith({ notifications_enabled: false });
  });
});
