import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuestionReviewTable } from '@/components/QuestionReviewTable';
import type { Question } from '@/lib/types';

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  arrayMove: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => undefined } },
}));

function makeQuestion(id: string, text: string): Question {
  return { id, text, type: 'short_text', required: false };
}

describe('QuestionReviewTable', () => {
  it('renders a row for each question', () => {
    const questions = [
      makeQuestion('a', 'First question'),
      makeQuestion('b', 'Second question'),
      makeQuestion('c', 'Third question'),
    ];
    render(
      <QuestionReviewTable
        questions={questions}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByDisplayValue('First question')).toBeInTheDocument();
  });

  it('shows an empty state message when there are no questions', () => {
    render(
      <QuestionReviewTable
        questions={[]}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
      />,
    );
    expect(screen.getByText(/no questions yet/i)).toBeInTheDocument();
  });
});
