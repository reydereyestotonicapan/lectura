import client from './client';
import { Day, Question, PaginatedResponse, UserResponse } from '../types/api';

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

export interface QuestionsResponse {
  questions: Question[];
  allAnswered: boolean;
}

export async function getQuestions(dayId: number): Promise<QuestionsResponse> {
  const { data } = await client.get(`/readings/${dayId}/questions`);
  return {
    questions: data.data,
    allAnswered: data.all_answered ?? false,
  };
}

export async function getResponses(page = 1): Promise<PaginatedResponse<UserResponse>> {
  const { data } = await client.get('/responses', { params: { page } });
  return data;
}
