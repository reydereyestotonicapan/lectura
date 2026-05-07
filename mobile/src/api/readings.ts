import client from './client';
import { Day, Question, PaginatedResponse } from '../types/api';

export async function getToday(): Promise<Day> {
  const { data } = await client.get('/readings/today');
  return data.data;
}

export async function getReadings(page = 1): Promise<PaginatedResponse<Day>> {
  const { data } = await client.get('/readings', { params: { page } });
  return data;
}

export async function getReading(id: number): Promise<Day> {
  const { data } = await client.get(`/readings/${id}`);
  return data.data;
}

export async function getQuestions(dayId: number): Promise<Question[]> {
  const { data } = await client.get(`/readings/${dayId}/questions`);
  return data.data;
}
