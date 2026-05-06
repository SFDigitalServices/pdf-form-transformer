import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { validatePdfBuffer } from '@/lib/validation';
import { parsePdfText } from '@/lib/pdfParser';
import { extractQuestionsFromText, ExtractionError } from '@/lib/extractQuestions';

export async function POST(request: NextRequest) {
  if (process.env.EXTRACTION_KILL_SWITCH === 'true') {
    return NextResponse.json(
      { error: 'This feature is temporarily unavailable. Please try again later.' },
      { status: 503 },
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    );
  }

  let file: File;
  try {
    const formData = await request.formData();
    const entry = formData.get('file');
    if (!entry || !(entry instanceof File)) {
      console.error('[extract] 400: no file in formData, entry type:', typeof entry, entry);
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    file = entry;
  } catch (e) {
    console.error('[extract] 400: formData parse error:', e);
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  console.log('[extract] file received:', file.name, file.size, file.type);
  const buffer = Buffer.from(await file.arrayBuffer());
  console.log('[extract] buffer length:', buffer.length, 'first bytes:', buffer.subarray(0, 8).toString('hex'));

  const validation = validatePdfBuffer(buffer);
  if (!validation.valid) {
    console.error('[extract] 400: validation failed:', validation);
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  let pdfText: string;
  try {
    pdfText = await parsePdfText(buffer);
  } catch (e) {
    console.error('[extract] 400: parsePdfText error:', e);
    return NextResponse.json(
      { error: 'Failed to read PDF. The file may be corrupted.' },
      { status: 400 },
    );
  }

  const scannedWarning =
    pdfText.trim().length < 50
      ? 'This PDF appears to be a scanned image. Results may be incomplete. You can edit questions below or enter them manually.'
      : undefined;

  try {
    const result = await extractQuestionsFromText(pdfText);
    return NextResponse.json({
      questions: result.questions,
      title: result.title,
      warning: result.warning ?? scannedWarning,
    });
  } catch (err) {
    if (err instanceof ExtractionError) {
      return NextResponse.json(
        {
          error:
            'Question extraction failed. You can enter your questions manually below, or try again.',
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
