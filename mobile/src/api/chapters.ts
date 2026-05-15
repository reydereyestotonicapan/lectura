import client from './client';
import { DayWithChapters } from '../types/chapter';

/**
 * Fetch all chapters with progress for a specific day
 * @param dayId - The ID of the day to fetch chapters for
 * @returns DayWithChapters containing chapters with user's progress
 */
export async function getChaptersWithProgress(dayId: number): Promise<DayWithChapters> {
  const { data } = await client.get(`/readings/${dayId}/chapters`);
  return data.data;
}

/**
 * Mark a chapter as read for the authenticated user
 * @param chapterId - The ID of the chapter to mark as read
 * @returns Progress record with id, day_chapter_id, and read_at timestamp
 */
export async function markChapterRead(chapterId: number): Promise<{ id: number; day_chapter_id: number; read_at: string }> {
  const { data } = await client.post(`/chapters/${chapterId}/progress`);
  return data.data;
}

/**
 * Mark a chapter as unread for the authenticated user
 * @param chapterId - The ID of the chapter to mark as unread
 * @returns boolean indicating success
 */
export async function markChapterUnread(chapterId: number): Promise<boolean> {
  const { data } = await client.delete(`/chapters/${chapterId}/progress`);
  return data.success;
}
