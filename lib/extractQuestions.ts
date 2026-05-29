import Anthropic from '@anthropic-ai/sdk';
import type { ExtractionResult, Question, QuestionType } from '@/lib/types';

const VALID_TYPES = new Set<string>([
  'short_text', 'long_text', 'email', 'phone', 'address',
  'date', 'number', 'yes_no', 'multiple_choice', 'checkboxes',
  'dropdown', 'file_upload', 'signature', 'statement',
]);

export class ExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExtractionError';
  }
}

const SYSTEM_PROMPT = `You are an expert form analyst helping to digitize government PDF forms for the City and County of San Francisco.
Extract all form questions from the provided PDF text.

Also identify the form title (the main heading at the top of the document).

For each question identify:
1. The question text (cleaned of any numbering prefixes like "1.", "a)", etc.)
2. The question type from this exact list: short_text, long_text, email, phone, address, date, number, yes_no, multiple_choice, checkboxes, dropdown, file_upload, signature, statement
3. Whether the field appears to be required
4. For multiple_choice, checkboxes, or dropdown: the answer options listed in the PDF

Rules:
- Include all form fields, not just sentences ending with "?"
- Exclude page headers, footers, section headings, and logos
- Use "statement" type for important instructional text that should appear in the digital form
- Do not invent options not present in the source PDF
- Preserve the original order of questions`;

const TOOL_INPUT_SCHEMA = {
  type: 'object' as const,
  properties: {
    title: {
      type: 'string',
      description: 'The form title as it appears at the top of the PDF, e.g. "Business License Application"',
    },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The question label or prompt text' },
          type: { type: 'string', enum: Array.from(VALID_TYPES) },
          required: { type: 'boolean' },
          options: {
            type: 'array',
            items: { type: 'string' },
            description: 'For multiple_choice, checkboxes, dropdown only',
          },
          helpText: { type: 'string', description: 'Optional hint or caption text' },
        },
        required: ['text', 'type', 'required'],
      },
    },
    warning: {
      type: 'string',
      description: 'Optional warning about extraction quality',
    },
  },
  required: ['questions'],
};

type RawQuestion = {
  text: string;
  type: string;
  required: boolean;
  options?: string[];
  helpText?: string;
};

export async function extractQuestionsFromText(pdfText: string): Promise<ExtractionResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools: [
        {
          name: 'extract_form_questions',
          description: 'Extract structured form questions from PDF text',
          input_schema: TOOL_INPUT_SCHEMA,
        },
      ],
      tool_choice: { type: 'any' },
      messages: [
        {
          role: 'user',
          content: `Please extract all form questions from the following PDF text:\n\n${pdfText}`,
        },
      ],
    });
  } catch (err) {
    throw new ExtractionError(
      err instanceof Error ? err.message : 'Failed to call extraction API',
    );
  }

  const toolUseBlock = response.content.find(b => b.type === 'tool_use');
  if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
    throw new ExtractionError('No tool use block returned by the model');
  }

  const input = toolUseBlock.input as { questions: RawQuestion[]; title?: string; warning?: string };

  const questions: Question[] = input.questions.map(q => ({
    id: crypto.randomUUID(),
    text: q.text,
    type: (VALID_TYPES.has(q.type) ? q.type : 'short_text') as QuestionType,
    required: q.required,
    ...(q.options?.length ? { options: q.options } : {}),
    ...(q.helpText ? { helpText: q.helpText } : {}),
  }));

  return { questions, title: input.title, warning: input.warning };
}
