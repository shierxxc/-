import { QuizSettings, Question, Operation } from './types';

const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateSingleQuestion = (settings: QuizSettings): Question => {
  const { operationMode, range } = settings;
  let num1: number, num2: number, answer: number;
  let operation: Operation;

  let chosenMode = operationMode;
  if (chosenMode === 'add_subtract') {
    chosenMode = Math.random() < 0.5 ? 'add' : 'subtract';
  }
  if (chosenMode === 'multiply_divide') {
    chosenMode = Math.random() < 0.5 ? 'multiply' : 'divide';
  }
  
  operation = chosenMode as Operation;

  switch (operation) {
    case 'add':
      num1 = getRandomInt(0, range);
      num2 = getRandomInt(0, range - num1);
      answer = num1 + num2;
      break;
    case 'subtract':
      const a = getRandomInt(0, range);
      const b = getRandomInt(0, range);
      num1 = Math.max(a, b);
      num2 = Math.min(a, b);
      answer = num1 - num2;
      break;
    case 'multiply':
      num1 = getRandomInt(0, range === 1 ? 1 : Math.floor(Math.sqrt(range)));
      num2 = num1 > 0 ? getRandomInt(0, Math.floor(range / num1)) : getRandomInt(0, range);
      answer = num1 * num2;
      break;
    case 'divide':
      num2 = getRandomInt(1, Math.floor(Math.sqrt(range)));
      answer = getRandomInt(0, Math.floor(range / num2));
      num1 = num2 * answer;
      break;
    default:
      // Fallback to addition
      num1 = getRandomInt(0, range);
      num2 = getRandomInt(0, range - num1);
      answer = num1 + num2;
      operation = 'add';
  }

  return { num1, num2, operation, answer };
};

export const generateQuestions = (settings: QuizSettings): Question[] => {
  const questions: Question[] = [];
  for (let i = 0; i < settings.numQuestions; i++) {
    questions.push(generateSingleQuestion(settings));
  }
  return questions;
};