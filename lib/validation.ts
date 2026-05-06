type ValidationSuccess = { valid: true };
type ValidationFailure = {
  valid: false;
  reason: 'invalid_type' | 'too_large';
  message: string;
};
export type ValidationResult = ValidationSuccess | ValidationFailure;

const DEFAULT_MAX_BYTES = parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10) * 1024 * 1024;

export function validatePdfBuffer(
  buffer: Buffer,
  maxSizeBytes = DEFAULT_MAX_BYTES,
): ValidationResult {
  if (buffer.length > maxSizeBytes) {
    const maxMb = maxSizeBytes / (1024 * 1024);
    return { valid: false, reason: 'too_large', message: `File must be under ${maxMb} MB.` };
  }
  // PDF spec allows %PDF header within the first 1024 bytes
  const header = buffer.subarray(0, 1024).toString('binary');
  if (!header.includes('%PDF')) {
    return { valid: false, reason: 'invalid_type', message: 'File must be a PDF.' };
  }
  return { valid: true };
}
