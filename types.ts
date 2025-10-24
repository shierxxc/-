
export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';
export type OperationMode = 'add' | 'subtract' | 'add_subtract' | 'multiply' | 'divide' | 'multiply_divide';
export type Range = 10 | 100 | 1000;
export type GameState = 'settings' | 'quiz' | 'results' | 'history';
export type Feedback = 'idle' | 'correct' | 'incorrect';

export interface QuizSettings {
  operationMode: OperationMode;
  range: Range;
  isTimerEnabled: boolean;
  numQuestions: number;
}

export interface Question {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
}

export interface MissedQuestion {
  question: Question;
  userAnswer: string;
}

export interface QuizResult {
  id: string;
  score: number;
  totalQuestions: number;
  timeTaken: number | null;
  date: number;
  settings: QuizSettings;
  missedQuestions: MissedQuestion[];
}
