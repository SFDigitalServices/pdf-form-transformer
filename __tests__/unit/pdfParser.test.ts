import { describe, it, expect, vi } from 'vitest';

const mockExtractText = vi.hoisted(() => vi.fn());

vi.mock('unpdf', () => ({
  extractText: mockExtractText,
}));

import { parsePdfText, PdfParseError } from '@/lib/pdfParser';

describe('parsePdfText', () => {
  it('returns the extracted text from a valid PDF buffer', async () => {
    mockExtractText.mockResolvedValueOnce({ text: 'What is your name?' });
    const result = await parsePdfText(Buffer.from('%PDF-1.4'));
    expect(result).toBe('What is your name?');
  });

  it('returns an empty string when unpdf returns no text', async () => {
    mockExtractText.mockResolvedValueOnce({ text: '' });
    const result = await parsePdfText(Buffer.from('%PDF-1.4'));
    expect(result).toBe('');
  });

  it('throws PdfParseError when parsing fails', async () => {
    mockExtractText.mockRejectedValueOnce(new Error('corrupted file'));
    await expect(parsePdfText(Buffer.from('bad data'))).rejects.toThrow(PdfParseError);
  });

  it('PdfParseError preserves the original message', async () => {
    mockExtractText.mockRejectedValueOnce(new Error('page limit exceeded'));
    await expect(parsePdfText(Buffer.from('bad'))).rejects.toThrow('page limit exceeded');
  });
});
