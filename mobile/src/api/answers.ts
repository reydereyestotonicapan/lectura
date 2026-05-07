import client from './client';
import { SubmitResponse } from '../types/api';

interface AnswerPayload {
  question_id: number;
  answer_id: number;
}

export async function submitAnswers(
  dayId: number,
  answers: AnswerPayload[],
): Promise<SubmitResponse> {
  const { data } = await client.post(`/readings/${dayId}/answers`, { answers });
  return data;
}
