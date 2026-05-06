'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { cn } from '@/lib/utils';

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface Props {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export function FileUploader({ onUpload, isUploading }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setValidationError(null);
    setSelectedFile(null);

    if (rejected.length > 0) {
      const code = rejected[0].errors[0]?.code;
      if (code === 'file-invalid-type') {
        setValidationError('Only PDF files are accepted.');
      } else if (code === 'file-too-large') {
        setValidationError(`File must be under ${MAX_SIZE_MB} MB.`);
      } else {
        setValidationError('Invalid file. Please upload a PDF under 10 MB.');
      }
      return;
    }

    if (accepted.length > 0) setSelectedFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_SIZE_BYTES,
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded p-8 text-center transition-colors',
          isUploading
            ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
            : isDragActive
              ? 'border-[#1b519e] bg-[#dfebfd] cursor-copy'
              : 'border-gray-300 bg-gray-50 cursor-pointer hover:border-[#1b519e] hover:bg-[#e5f1ff]',
        )}
      >
        <input {...getInputProps()} aria-label="Upload a PDF form" />
        {isDragActive ? (
          <p className="text-[#1b519e] font-medium">Drop the PDF here…</p>
        ) : (
          <div className="space-y-1">
            <p className="text-[#0b0c0c]">
              Drag and drop a PDF here, or{' '}
              <span className="text-[#2a60af] underline">browse files</span>
            </p>
            <p className="text-sm text-[#535454]">PDF only · max {MAX_SIZE_MB} MB</p>
          </div>
        )}
      </div>

      {validationError && (
        <p role="alert" className="text-sm text-[#ac0000]">
          {validationError}
        </p>
      )}

      {selectedFile && !validationError && (
        <p className="text-sm text-[#535454]">
          Selected:{' '}
          <strong className="text-[#0b0c0c] font-medium">{selectedFile.name}</strong>{' '}
          ({(selectedFile.size / 1024).toFixed(0)} KB)
        </p>
      )}

      <button
        type="button"
        onClick={() => selectedFile && !isUploading && onUpload(selectedFile)}
        disabled={!selectedFile || isUploading}
        className={cn(
          'h-10 px-4 rounded border text-sm font-medium transition-colors',
          selectedFile && !isUploading
            ? 'bg-[#1b519e] border-[#1b519e] text-white hover:bg-[#001d4e]'
            : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed',
        )}
      >
        {isUploading ? (
          <span className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              aria-hidden="true"
            />
            Extracting…
          </span>
        ) : (
          'Extract Questions'
        )}
      </button>
    </div>
  );
}
