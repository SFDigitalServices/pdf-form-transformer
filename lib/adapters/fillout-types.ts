export interface FilloutPickerString {
  logic: { value: string; references: Record<string, never> };
  expectedTypes: ['string'];
  ___LOGIC_TYPE___: 'pickerString';
}

export interface FilloutBoolLogic {
  logic: boolean | { and: never[] };
  expectedTypes: ['boolean'];
  ___LOGIC_TYPE___: 'logic';
}

export type FilloutWidgetType =
  | 'ShortAnswer'
  | 'LongAnswer'
  | 'EmailInput'
  | 'PhoneNumber'
  | 'Address'
  | 'DatePicker'
  | 'NumberInput'
  | 'MultipleChoice'
  | 'Checkboxes'
  | 'Dropdown'
  | 'FileUpload'
  | 'Signature'
  | 'Paragraph'
  | 'Button'
  | 'ThankYou';

export interface FilloutWidget {
  id: string;
  name: string;
  type: FilloutWidgetType;
  position: { row: number; column?: number };
  template: Record<string, unknown>;
}

export interface FilloutFormStepTemplate {
  widgets: Record<string, FilloutWidget>;
}

export interface FilloutEndingStepTemplate {
  type: 'thank_you';
  widgets: Record<string, FilloutWidget>;
  confetti: boolean;
}

export interface FilloutFormStep {
  id: string;
  name: string;
  type: 'form';
  nextStep: { isFinal: false; branches: never[]; defaultNextStep: string };
  position: { x: number; y: number };
  template: FilloutFormStepTemplate;
}

export interface FilloutEndingStep {
  id: string;
  name: string;
  type: 'ending';
  nextStep: { isFinal: true; branches: never[]; defaultNextStep: '' };
  template: FilloutEndingStepTemplate;
}

export type FilloutStep = FilloutFormStep | FilloutEndingStep;

export interface FilloutTemplate {
  steps: Record<string, FilloutStep>;
  quizzes: {
    answers: Record<string, never>;
    enabled: false;
    settings: { disableShowingCorrectAnswers: false };
  };
  settings: Record<string, never>;
  firstStep: string;
  urlParams: never[];
  calculations: Record<string, never>;
  integrations: Record<string, never>;
  themePublicId: string;
}

export interface FilloutExport {
  ___FILLOUT_EXPORT_VERSION___: 2;
  template: FilloutTemplate;
  settings: Record<string, never>;
  theme: unknown;
  workflows: never[];
  type: 'form';
}
