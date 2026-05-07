import client from './client';
import { ApiUser } from '../types/api';

export async function firebaseLogin(idToken: string): Promise<{ token: string; user: ApiUser }> {
  const { data } = await client.post('/auth/firebase-login', { firebase_token: idToken });
  return data;
}
