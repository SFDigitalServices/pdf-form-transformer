'use client';

import { useState } from 'react';
import type { ExtractionResult } from '@/lib/types';

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'success'; result: ExtractionResult; sourceFilename: string }
  | { status: 'error'; message: string };

export function useFileUpload() {
  const [state, setState] = useState<UploadState>({ status: 'idle' });

  async function upload(file: File) {
    setState({ status: 'uploading' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);

    try {
      const res = await fetch('/api/extract', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setState({
          status: 'error',
          message: data.error ?? 'Extraction failed. Please try again.',
        });
        return;
      }

      setState({ status: 'success', result: data, sourceFilename: file.name });
    } catch {
      setState({
        status: 'error',
        message: 'Network error. Please check your connection and try again.',
      });
    }
  }

  function reset() {
    setState({ status: 'idle' });
  }

  return { state, upload, reset };
}
