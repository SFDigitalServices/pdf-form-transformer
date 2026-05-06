import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useQuestionList } from '@/hooks/useQuestionList';
import { type Question } from '@/lib/types';

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: `id-${Math.random().toString(36).slice(2)}`,
    text: 'Test question',
    type: 'short_text',
    required: false,
    ...overrides,
  };
}

describe('useQuestionList', () => {
  it('LOAD_QUESTIONS sets the list to exactly the provided questions', () => {
    const { result } = renderHook(() => useQuestionList());
    const questions = Array.from({ length: 5 }, (_, i) =>
      makeQuestion({ id: `id-${i}`, text: `Question ${i}` }),
    );
    act(() => result.current.loadQuestions(questions));
    expect(result.current.questions).toHaveLength(5);
    expect(result.current.questions[2].text).toBe('Question 2');
  });

  it('ADD_QUESTION appends a blank row with a unique id', () => {
    const { result } = renderHook(() => useQuestionList());
    const existing = makeQuestion({ id: 'existing' });
    act(() => result.current.loadQuestions([existing]));
    act(() => result.current.addQuestion());

    expect(result.current.questions).toHaveLength(2);
    const added = result.current.questions[1];
    expect(added.text).toBe('');
    expect(added.type).toBe('short_text');
    expect(added.required).toBe(false);
    expect(added.id).not.toBe('existing');
  });

  it('UPDATE_QUESTION changes only the target question', () => {
    const { result } = renderHook(() => useQuestionList());
    const qs = [
      makeQuestion({ id: 'a', text: 'Old A' }),
      makeQuestion({ id: 'b', text: 'Old B' }),
    ];
    act(() => result.current.loadQuestions(qs));
    act(() => result.current.updateQuestion('a', { text: 'New A' }));

    expect(result.current.questions[0].text).toBe('New A');
    expect(result.current.questions[1].text).toBe('Old B');
  });

  it('DELETE_QUESTION removes only the target question', () => {
    const { result } = renderHook(() => useQuestionList());
    const qs = [
      makeQuestion({ id: 'a' }),
      makeQuestion({ id: 'b' }),
      makeQuestion({ id: 'c' }),
    ];
    act(() => result.current.loadQuestions(qs));
    act(() => result.current.deleteQuestion('b'));

    expect(result.current.questions).toHaveLength(2);
    expect(result.current.questions.map((q) => q.id)).toEqual(['a', 'c']);
  });

  it('REORDER_QUESTIONS replaces the list in the new order', () => {
    const { result } = renderHook(() => useQuestionList());
    const qs = [
      makeQuestion({ id: 'a' }),
      makeQuestion({ id: 'b' }),
      makeQuestion({ id: 'c' }),
    ];
    act(() => result.current.loadQuestions(qs));
    act(() => result.current.reorderQuestions([qs[2], qs[0], qs[1]]));

    expect(result.current.questions.map((q) => q.id)).toEqual(['c', 'a', 'b']);
  });
});
