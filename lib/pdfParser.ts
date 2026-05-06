import path from 'path';

export class PdfParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PdfParseError';
  }
}

export async function parsePdfText(buffer: Buffer): Promise<string> {
  try {
    // Import pdfjs-dist directly. It is listed in serverExternalPackages so Next.js
    // loads it as a native Node.js module, giving us a single module instance.
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

    pdfjs.GlobalWorkerOptions.workerSrc = path.join(
      process.cwd(),
      'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
    );

    const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      pages.push(
        content.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' '),
      );
    }
    await doc.destroy();
    return pages.join('\n');
  } catch (err) {
    throw new PdfParseError(err instanceof Error ? err.message : 'Failed to parse PDF');
  }
}
