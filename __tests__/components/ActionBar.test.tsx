import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ActionBar } from '@/components/ActionBar';

describe('ActionBar', () => {
  it('disables Generate JSON when there are no questions', () => {
    render(<ActionBar questionCount={0} onAdd={vi.fn()} onGenerate={vi.fn()} />);
    expect(screen.getByRole('button', { name: /generate json/i })).toBeDisabled();
  });

  it('enables Generate JSON when there is at least one question', () => {
    render(<ActionBar questionCount={1} onAdd={vi.fn()} onGenerate={vi.fn()} />);
    expect(screen.getByRole('button', { name: /generate json/i })).not.toBeDisabled();
  });

  it('Add Question button is always enabled and calls onAdd', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ActionBar questionCount={0} onAdd={onAdd} onGenerate={vi.fn()} />);

    const btn = screen.getByRole('button', { name: /add question/i });
    expect(btn).not.toBeDisabled();
    await user.click(btn);
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('calls onGenerate when Generate JSON is clicked with questions present', async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<ActionBar questionCount={3} onAdd={vi.fn()} onGenerate={onGenerate} />);

    await user.click(screen.getByRole('button', { name: /generate json/i }));
    expect(onGenerate).toHaveBeenCalledOnce();
  });
});
