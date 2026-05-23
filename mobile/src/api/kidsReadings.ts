import axios from 'axios';
import client from './client';
import { KidsReading, PaginatedResponse } from '../types/api';

/**
 * Fetch paginated list of published kids readings
 * @param page - Page number (defaults to 1)
 * @returns Paginated response with kids readings
 */
export async function getKidsReadings(page = 1): Promise<PaginatedResponse<KidsReading>> {
  const { data } = await client.get('/kids-readings', { params: { page } });
  return data;
}

/**
 * Fetch a single kids reading by ID
 * @param id - Reading ID
 * @returns Kids reading details
 */
export async function getKidsReading(id: number): Promise<KidsReading> {
  const { data } = await client.get(`/kids-readings/${id}`);
  return data.data;
}

/**
 * Fetch the current week's kids reading
 * Returns null if no published readings exist (handles 404 gracefully)
 * @returns Current kids reading or null
 */
export async function getCurrentKidsReading(): Promise<KidsReading | null> {
  try {
    const { data } = await client.get('/kids-readings/current');
    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Get the signed download URL for a kids reading's PDF
 * @param id - Reading ID
 * @returns Signed S3 URL for PDF download
 */
export async function getKidsReadingDownloadUrl(id: number): Promise<string> {
  const { data } = await client.get(`/kids-readings/${id}/download`);
  return data.url;
}
