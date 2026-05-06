import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted ensures mockCreate is available when the vi.mock factory runs
const mockCreate = vi.hoisted(() => vi.fn());

vi.mock('@anthropic-ai/sdk', () => ({
  // Must use a regular function (not arrow) so it can be called with `new`
  default: vi.fn().mockImplementation(function (this: { messages: unknown }) {
    this.messages = { create: mockCreate };
  }),
}));

import { extractQuestionsFromText, ExtractionError } from '@/lib/extractQuestions';

function makeToolUseResponse(input: unknown) {
  return {
    content: [
      {
        type: 'tool_use',
        id: 'tu_123',
        name: 'extract_form_questions',
        input,
      },
    ],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('extractQuestionsFromText', () => {
  it('maps tool use output to ExtractionResult with generated ids', async () => {
    mockCreate.mockResolvedValueOnce(
      makeToolUseResponse({
        questions: [
          { text: 'Full name', type: 'short_text', required: true },
          { text: 'Email', type: 'email', required: false },
        ],
      }),
    );

    const result = await extractQuestionsFromText('Name: ___ Email: ___');
    expect(result.questions).toHaveLength(2);
    expect(result.questions[0].type).toBe('short_text');
    expect(result.questions[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('propagates warning from tool output', async () => {
    mockCreate.mockResolvedValueOnce(
      makeToolUseResponse({
        questions: [],
        warning: 'Scanned PDF detected',
      }),
    );

    const result = await extractQuestionsFromText('');
    expect(result.warning).toBe('Scanned PDF detected');
  });

  it('defaults unknown question types to short_text', async () => {
    mockCreate.mockResolvedValueOnce(
      makeToolUseResponse({
        questions: [{ text: 'Mystery field', type: 'unknown_type', required: false }],
      }),
    );

    const result = await extractQuestionsFromText('some text');
    expect(result.questions[0].type).toBe('short_text');
  });

  it('throws ExtractionError when the API call fails', async () => {
    mockCreate.mockRejectedValueOnce(new Error('rate limit'));
    await expect(extractQuestionsFromText('text')).rejects.toThrow(ExtractionError);
  });

  it('throws ExtractionError when response contains no tool_use block', async () => {
    mockCreate.mockResolvedValueOnce({ content: [{ type: 'text', text: 'oops' }] });
    await expect(extractQuestionsFromText('text')).rejects.toThrow(ExtractionError);
  });
});
