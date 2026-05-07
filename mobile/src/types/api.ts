export interface Answer {
  id: number;
  description: string;
}

export interface Question {
  id: number;
  description: string;
  answers: Answer[];
}

export interface Day {
  id: number;
  date_assigned: string;
  chapters: string;
  day_month: string;
  questions?: Question[];
  answered_count?: number;
}

export interface SubmitResult {
  question_id: number;
  answer_id: number;
  is_correct: boolean;
  correct_answer_id: number | null;
  skipped: boolean;
}

export interface SubmitResponse {
  score: number;
  total: number;
  results: SubmitResult[];
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
