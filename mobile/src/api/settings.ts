import client from './client';
import { UserSettings, BibleSource } from '../types/chapter';

export async function getSettings(): Promise<UserSettings> {
  const response = await client.get('/settings');
  return response.data.data;
}

export async function updateSettings(settings: Partial<{ bible_source: BibleSource; bible_version: string }>): Promise<UserSettings> {
  const response = await client.put('/settings', settings);
  return response.data.data;
}
