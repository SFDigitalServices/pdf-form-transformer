import { describe, it, expect, vi } from 'vitest';

const mockGetText = vi.hoisted(() => vi.fn());

vi.mock('pdf-parse', () => ({
  PDFParse: vi.fn().mockImplementation(function (this: { getText: unknown }) {
    this.getText = mockGetText;
  }),
}));

import { parsePdfText, PdfParseError } from '@/lib/pdfParser';

describe('parsePdfText', () => {
  it('returns the extracted text from a valid PDF buffer', async () => {
    mockGetText.mockResolvedValueOnce({ text: 'What is your name?' });
    const result = await parsePdfText(Buffer.from('%PDF-1.4'));
    expect(result).toBe('What is your name?');
  });

  it('returns an empty string when pdf-parse returns no text', async () => {
    mockGetText.mockResolvedValueOnce({ text: '' });
    const result = await parsePdfText(Buffer.from('%PDF-1.4'));
    expect(result).toBe('');
  });

  it('throws PdfParseError when parsing fails', async () => {
    mockGetText.mockRejectedValueOnce(new Error('corrupted file'));
    await expect(parsePdfText(Buffer.from('bad data'))).rejects.toThrow(PdfParseError);
  });

  it('PdfParseError preserves the original message', async () => {
    mockGetText.mockRejectedValueOnce(new Error('page limit exceeded'));
    await expect(parsePdfText(Buffer.from('bad'))).rejects.toThrow('page limit exceeded');
  });
});
