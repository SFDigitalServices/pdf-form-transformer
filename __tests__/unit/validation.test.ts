import { describe, it, expect } from 'vitest';
import { validatePdfBuffer } from '@/lib/validation';

const PDF_MAGIC = Buffer.from('%PDF-1.4 minimal content');
const NOT_PDF = Buffer.from('This is not a PDF file at all');

describe('validatePdfBuffer', () => {
  it('accepts a valid PDF buffer under the size limit', () => {
    expect(validatePdfBuffer(PDF_MAGIC).valid).toBe(true);
  });

  it('rejects a non-PDF buffer with reason invalid_type', () => {
    const result = validatePdfBuffer(NOT_PDF);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toBe('invalid_type');
  });

  it('rejects an oversized buffer with reason too_large', () => {
    const big = Buffer.concat([Buffer.from('%PDF-'), Buffer.alloc(11 * 1024 * 1024)]);
    const result = validatePdfBuffer(big, 10 * 1024 * 1024);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toBe('too_large');
  });

  it('rejects an empty buffer', () => {
    const result = validatePdfBuffer(Buffer.alloc(0));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toBe('invalid_type');
  });

  it('rejects a buffer with PDF magic bytes that exceeds size limit', () => {
    const big = Buffer.concat([Buffer.from('%PDF-'), Buffer.alloc(5 * 1024 * 1024)]);
    const result = validatePdfBuffer(big, 2 * 1024 * 1024);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toBe('too_large');
  });
});
