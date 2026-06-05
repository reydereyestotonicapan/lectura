/**
 * Tests for useNotifications hook
 * Task 9.2 — Requirements: 1.1, 1.2, 1.5, 4.1, 4.2, 4.4
 */
import { renderHook, act } from '@testing-library/react-native';

// ── Mocks ────────────────────────────────────────────────────────────────────
// NOTE: expo-notifications calls setNotificationHandler at module-load time
// (top-level in useNotifications.ts), so the mock factory must be self-contained
// and not reference outer jest.fn() variables.

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  getLastNotificationResponseAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
}));

jest.mock('../../storage/notificationStore', () => ({
  saveNotificationDenied: jest.fn(),
  isNotificationDenied: jest.fn(),
}));

jest.mock('../../api/pushToken', () => ({
  registerPushToken: jest.fn(),
}));

// Import after mocks are registered
import * as Notifications from 'expo-notifications';
import * as notificationStore from '../../storage/notificationStore';
import * as pushTokenApi from '../../api/pushToken';
import { useNotifications } from '../../hooks/useNotifications';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a minimal NavigationContainerRef-like ref */
function makeNavRef(isReady = true) {
  return {
    current: {
      isReady: () => isReady,
      navigate: jest.fn(),
    },
  } as any;
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  // Default: not previously denied
  (notificationStore.isNotificationDenied as jest.Mock).mockResolvedValue(false);
  // Default: permission granted
  (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  // Default: token returned
  (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'ExponentPushToken[test123]' });
  // Default: no pending notification response
  (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(null);
  // Default: listener returns a subscription with remove()
  (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({
    remove: jest.fn(),
  });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useNotifications', () => {
  describe('when not authenticated', () => {
    it('does not request permissions or retrieve a token', async () => {
      const navRef = makeNavRef();

      renderHook(() => useNotifications(navRef, false));

      // Give async setup a chance to run (it should not)
      await act(async () => {});

      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
      expect(pushTokenApi.registerPushToken).not.toHaveBeenCalled();
    });
  });

  describe('when authenticated and permission is granted', () => {
    it('retrieves the Expo push token and registers it with the backend', async () => {
      const navRef = makeNavRef();

      renderHook(() => useNotifications(navRef, true));

      await act(async () => {});

      expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
      expect(pushTokenApi.registerPushToken).toHaveBeenCalledWith('ExponentPushToken[test123]');
    });

    it('does not attempt token retrieval when previously denied', async () => {
      (notificationStore.isNotificationDenied as jest.Mock).mockResolvedValue(true);
      const navRef = makeNavRef();

      renderHook(() => useNotifications(navRef, true));

      await act(async () => {});

      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
      expect(pushTokenApi.registerPushToken).not.toHaveBeenCalled();
    });
  });

  describe('when permission is denied', () => {
    it('stores the denial in SecureStore and does not retrieve a token', async () => {
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      const navRef = makeNavRef();

      renderHook(() => useNotifications(navRef, true));

      await act(async () => {});

      expect(notificationStore.saveNotificationDenied).toHaveBeenCalledTimes(1);
      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
      expect(pushTokenApi.registerPushToken).not.toHaveBeenCalled();
    });
  });

  describe('notification tap navigation', () => {
    it('navigates to TodayTab when a background notification with screen=TodayScreen is tapped', async () => {
      const navRef = makeNavRef();

      const pendingResponse = {
        notification: {
          request: { content: { data: { screen: 'TodayScreen' } } },
        },
      };
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(pendingResponse);

      renderHook(() => useNotifications(navRef, true));

      await act(async () => {});

      expect(navRef.current.navigate).toHaveBeenCalledWith('TodayTab');
    });

    it('does not navigate when background notification has a different screen', async () => {
      const navRef = makeNavRef();

      const pendingResponse = {
        notification: {
          request: { content: { data: { screen: 'ProfileScreen' } } },
        },
      };
      (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValue(pendingResponse);

      renderHook(() => useNotifications(navRef, true));

      await act(async () => {});

      expect(navRef.current.navigate).not.toHaveBeenCalled();
    });

    it('navigates to TodayTab when a foreground notification with screen=TodayScreen is tapped', async () => {
      const navRef = makeNavRef();
      let capturedListener: ((response: any) => void) | null = null;

      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation((cb) => {
        capturedListener = cb;
        return { remove: jest.fn() };
      });

      renderHook(() => useNotifications(navRef, true));

      await act(async () => {});

      // Simulate foreground tap
      act(() => {
        capturedListener?.({
          notification: {
            request: { content: { data: { screen: 'TodayScreen' } } },
          },
        });
      });

      expect(navRef.current.navigate).toHaveBeenCalledWith('TodayTab');
    });

    it('removes the foreground listener on unmount', async () => {
      const navRef = makeNavRef();
      const mockRemove = jest.fn();

      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({
        remove: mockRemove,
      });

      const { unmount } = renderHook(() => useNotifications(navRef, true));

      await act(async () => {});

      unmount();

      expect(mockRemove).toHaveBeenCalledTimes(1);
    });
  });
});
