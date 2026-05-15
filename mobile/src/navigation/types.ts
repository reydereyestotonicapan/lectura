import { Question, SubmitResult } from '../types/api';

export type AuthStackParamList = {
  Login: undefined;
};

export type TodayStackParamList = {
  Today: undefined;
  Quiz: { dayId: number };
  Results: {
    dayId: number;
    score: number;
    total: number;
    results: SubmitResult[];
    questions: Question[];
  };
};

export type ReadingsStackParamList = {
  ReadingsList: undefined;
  Quiz: { dayId: number };
  Results: {
    dayId: number;
    score: number;
    total: number;
    results: SubmitResult[];
    questions: Question[];
  };
};

export type AppTabsParamList = {
  TodayTab: undefined;
  ReadingsTab: undefined;
  History: undefined;
  Settings: undefined;
  Profile: undefined;
};
