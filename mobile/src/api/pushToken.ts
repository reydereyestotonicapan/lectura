import client from './client';

export async function registerPushToken(token: string): Promise<void> {
  await client.put('/push-token', { expo_push_token: token });
}
