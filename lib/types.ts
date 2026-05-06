export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'phone'
  | 'address'
  | 'date'
  | 'number'
  | 'yes_no'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'file_upload'
  | 'signature'
  | 'statement';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  helpText?: string;
}

export interface ExtractionResult {
  questions: Question[];
  title?: string;
  warning?: string;
}
