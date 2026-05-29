import { extractText } from 'unpdf';

export class PdfParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PdfParseError';
  }
}

export async function parsePdfText(buffer: Buffer): Promise<string> {
  try {
    const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
    return text;
  } catch (err) {
    throw new PdfParseError(err instanceof Error ? err.message : 'Failed to parse PDF');
  }
}
