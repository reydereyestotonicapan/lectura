import client from './client';
import { ApiUser } from '../types/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function emailLogin(credentials: LoginCredentials): Promise<{ token: string; user: ApiUser }> {
  const { data } = await client.post('/auth/login', credentials);
  return data;
}

export async function firebaseLogin(idToken: string): Promise<{ token: string; user: ApiUser }> {
  const { data } = await client.post('/auth/firebase-login', { firebase_token: idToken });
  return data;
}
