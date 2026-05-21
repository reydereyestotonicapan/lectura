import { Question, SubmitResult } from '../types/api';

export type AuthStackParamList = {
  Login: undefined;
};

export type TodayStackParamList = {
  Today: undefined;
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

export type AccountStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

export type AppTabsParamList = {
  TodayTab: undefined;
  History: undefined;
  Account: undefined;
};
