import type { Question } from '@/lib/types';

export interface FormMeta {
  sourceFilename: string;
  formTitle: string;
}

export interface FormAdapter {
  name: string;
  transform(questions: Question[], meta: FormMeta): unknown;
  fileExtension: string;
  mimeType: string;
}
