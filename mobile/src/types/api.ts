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
  questions_count?: number;
  answered_count?: number;
}

export interface SubmitResult {
  question_id: number;
  answer_id: number | null;
  comment_user: string | null;
  is_correct: boolean | null;
  is_open_question: boolean;
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

export interface UserResponse {
  id: number;
  status: 'Correcta' | 'Incorrecta' | 'Pendiente';
  question: string;
  your_answer: string | null;
  correct_answer: string | null;
  team_comment: string | null;
  day_month: string;
  chapters: string;
  date: string;
  created_at: string;
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
