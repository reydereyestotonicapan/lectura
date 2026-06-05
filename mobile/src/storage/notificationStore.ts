import * as SecureStore from 'expo-secure-store';

const NOTIFICATION_DENIED_KEY = 'notification_permission_denied';

export async function saveNotificationDenied(): Promise<void> {
  await SecureStore.setItemAsync(NOTIFICATION_DENIED_KEY, 'true');
}

export async function isNotificationDenied(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(NOTIFICATION_DENIED_KEY);
  return value === 'true';
}
