import client from './client';
import { ApiUser } from '../types/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export async function emailLogin(credentials: LoginCredentials): Promise<{ token: string; user: ApiUser }> {
  const { data } = await client.post('/auth/login', credentials);
  return data;
}

export async function firebaseLogin(idToken: string): Promise<{ token: string; user: ApiUser }> {
  const { data } = await client.post('/auth/firebase-login', { firebase_token: idToken });
  return data;
}

export async function register(credentials: RegisterCredentials): Promise<{ token: string; user: ApiUser }> {
  const { data } = await client.post('/auth/register', credentials);
  return data;
}

export async function forgotPassword(email: string): Promise<void> {
  await client.post('/auth/forgot-password', { email });
}

export async function deleteAccount(): Promise<void> {
  await client.delete('/account');
}
