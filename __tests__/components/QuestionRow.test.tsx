import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QuestionRow } from '@/components/QuestionRow';
import type { Question } from '@/lib/types';

vi.mock('@dnd-kit/sortable', () => ({
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

const q: Question = {
  id: 'q1',
  text: 'What is your name?',
  type: 'short_text',
  required: false,
};

describe('QuestionRow', () => {
  it('renders the question text in the input', () => {
    render(<QuestionRow question={q} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByDisplayValue('What is your name?')).toBeInTheDocument();
  });

  it('calls onUpdate with new text when the text input changes', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(<QuestionRow question={q} onUpdate={onUpdate} onDelete={vi.fn()} />);

    const input = screen.getByDisplayValue('What is your name?');
    await user.clear(input);
    await user.type(input, 'Full name');

    expect(onUpdate).toHaveBeenCalledWith('q1', expect.objectContaining({ text: expect.any(String) }));
  });

  it('calls onDelete with the question id when delete is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<QuestionRow question={q} onUpdate={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /delete question/i }));
    expect(onDelete).toHaveBeenCalledWith('q1');
  });

  it('shows the options input for multiple_choice type', () => {
    render(
      <QuestionRow
        question={{ ...q, type: 'multiple_choice', options: ['Yes', 'No'] }}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/options/i)).toBeInTheDocument();
  });

  it('does not show the options input for short_text type', () => {
    render(<QuestionRow question={q} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByLabelText(/options/i)).not.toBeInTheDocument();
  });
});
