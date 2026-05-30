import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';
import { registerPushToken } from '../api/pushToken';
import { saveNotificationDenied, isNotificationDenied } from '../storage/notificationStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export function useNotifications(
  navigationRef: React.RefObject<NavigationContainerRef<any>>,
  isAuthenticated: boolean,
): void {
  const responseListenerRef = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function setup() {
      // Skip if previously denied
      const denied = await isNotificationDenied();
      if (denied) return;

      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== 'granted') {
        await saveNotificationDenied();
        return;
      }

      // Android channel required
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      await registerPushToken(tokenData.data);
    }

    setup();

    // Handle notification tap (background / killed)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleNotificationResponse(response, navigationRef);
    });

    // Handle notification tap (foreground)
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => handleNotificationResponse(response, navigationRef),
    );

    return () => {
      responseListenerRef.current?.remove();
    };
  }, [isAuthenticated, navigationRef]);
}

function handleNotificationResponse(
  response: Notifications.NotificationResponse,
  navigationRef: React.RefObject<NavigationContainerRef<any>>,
): void {
  const screen = response.notification.request.content.data?.screen as string | undefined;
  if (screen === 'TodayScreen' && navigationRef.current?.isReady()) {
    navigationRef.current.navigate('TodayTab' as never);
  }
}
