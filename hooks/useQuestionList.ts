'use client';

import { useReducer } from 'react';
import { type Question } from '@/lib/types';

type State = { questions: Question[] };

export type QuestionListAction =
  | { type: 'LOAD_QUESTIONS'; questions: Question[] }
  | { type: 'ADD_QUESTION' }
  | { type: 'UPDATE_QUESTION'; id: string; changes: Partial<Omit<Question, 'id'>> }
  | { type: 'DELETE_QUESTION'; id: string }
  | { type: 'REORDER_QUESTIONS'; questions: Question[] };

export function questionListReducer(state: State, action: QuestionListAction): State {
  switch (action.type) {
    case 'LOAD_QUESTIONS':
      return { questions: action.questions };
    case 'ADD_QUESTION':
      return {
        questions: [
          ...state.questions,
          { id: crypto.randomUUID(), text: '', type: 'short_text', required: false },
        ],
      };
    case 'UPDATE_QUESTION':
      return {
        questions: state.questions.map((q) =>
          q.id === action.id ? { ...q, ...action.changes } : q,
        ),
      };
    case 'DELETE_QUESTION':
      return { questions: state.questions.filter((q) => q.id !== action.id) };
    case 'REORDER_QUESTIONS':
      return { questions: action.questions };
    default:
      return state;
  }
}

export function useQuestionList() {
  const [state, dispatch] = useReducer(questionListReducer, { questions: [] });

  return {
    questions: state.questions,
    loadQuestions: (questions: Question[]) =>
      dispatch({ type: 'LOAD_QUESTIONS', questions }),
    addQuestion: () => dispatch({ type: 'ADD_QUESTION' }),
    updateQuestion: (id: string, changes: Partial<Omit<Question, 'id'>>) =>
      dispatch({ type: 'UPDATE_QUESTION', id, changes }),
    deleteQuestion: (id: string) => dispatch({ type: 'DELETE_QUESTION', id }),
    reorderQuestions: (questions: Question[]) =>
      dispatch({ type: 'REORDER_QUESTIONS', questions }),
  };
}
