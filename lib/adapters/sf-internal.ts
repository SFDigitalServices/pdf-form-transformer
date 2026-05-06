import { nanoid } from 'nanoid';
import type { Question, QuestionType } from '@/lib/types';
import type { FormAdapter, FormMeta } from './types';
import type { FilloutExport, FilloutWidget, FilloutWidgetType } from './fillout-types';
import { SF_GOV_THEME, SF_GOV_THEME_PUBLIC_ID } from './sf-theme';

function pStr(value: string) {
  return {
    logic: { value, references: {} as Record<string, never> },
    expectedTypes: ['string'] as ['string'],
    ___LOGIC_TYPE___: 'pickerString' as const,
  };
}

function pBool(value: boolean) {
  return {
    logic: value as boolean | { and: never[] },
    expectedTypes: ['boolean'] as ['boolean'],
    ___LOGIC_TYPE___: 'logic' as const,
  };
}

function emptyCondition() {
  return {
    logic: { and: [] as never[] },
    expectedTypes: ['boolean'] as ['boolean'],
    ___LOGIC_TYPE___: 'logic' as const,
  };
}

const TYPE_MAP: Record<QuestionType, FilloutWidgetType> = {
  short_text: 'ShortAnswer',
  long_text: 'LongAnswer',
  email: 'EmailInput',
  phone: 'PhoneNumber',
  address: 'Address',
  date: 'DatePicker',
  number: 'NumberInput',
  yes_no: 'MultipleChoice',
  multiple_choice: 'MultipleChoice',
  checkboxes: 'Checkboxes',
  dropdown: 'Dropdown',
  file_upload: 'FileUpload',
  signature: 'Signature',
  statement: 'Paragraph',
};

function buildOptions(values: string[]) {
  return {
    staticOptions: values.map(v => ({
      id: nanoid(4),
      label: pStr(v),
      value: pStr(v),
    })),
  };
}

function buildWidget(question: Question, row: number): FilloutWidget {
  const filloutType = TYPE_MAP[question.type];

  if (question.type === 'statement') {
    return {
      id: question.id,
      name: question.text.slice(0, 50),
      type: 'Paragraph',
      position: { row, column: 0 },
      template: {
        contents: pStr(`<p>${question.text}</p>`),
        inHeader: false,
        alwaysHide: false,
        showOrHide: 'show_when',
        showOrHideCondition: emptyCondition(),
      },
    };
  }

  const base: Record<string, unknown> = {
    label: pStr(`<p>${question.text}</p>`),
    caption: pStr(question.helpText ?? ''),
    regex: pStr(''),
    inHeader: false,
    alwaysHide: false,
    showOrHide: 'show_when',
    required: pBool(question.required),
    condition: emptyCondition(),
    showOrHideCondition: emptyCondition(),
    maxLength: pStr(''),
    minLength: pStr(''),
    validationPattern: 'none',
    validationErrorMessage: pStr(''),
  };

  const hasOptions = ['yes_no', 'multiple_choice', 'checkboxes', 'dropdown'].includes(question.type);

  if (hasOptions) {
    const optionValues =
      question.type === 'yes_no' ? ['Yes', 'No'] : (question.options ?? []);
    base.options = buildOptions(optionValues);
    base.optionsToShow = [];
    base.optionsMappings = false;
    base.randomizeOptionsOrder = false;
    base.defaultValue = pStr('');
    if (filloutType === 'MultipleChoice') {
      base.theme = 'standard';
      base.layout = 'single_column';
    }
  } else {
    base.placeholder = pStr('');
    base.defaultValue = pStr('');
  }

  return {
    id: question.id,
    name: question.text.slice(0, 50),
    type: filloutType,
    position: { row, column: 0 },
    template: base,
  };
}

function buildButton(row: number, nextStepId: string): FilloutWidget {
  return {
    id: `btn_${nanoid(6)}`,
    name: 'Next button',
    type: 'Button',
    position: { row, column: 0 },
    template: {
      text: { logic: { value: '', references: {} }, ___LOGIC_TYPE___: 'pickerString' },
      disabled: emptyCondition(),
      inHeader: false,
      alignment: 'left',
      alwaysHide: false,
      showOrHide: 'show_when',
      showBackButton: true,
      nextStep: { isFinal: false, branches: [], defaultNextStep: nextStepId },
      showOrHideCondition: emptyCondition(),
    },
  };
}

function buildThankYou(): FilloutWidget {
  return {
    id: `ty_${nanoid(6)}`,
    name: 'thankYou1',
    type: 'ThankYou',
    position: { row: 1 },
    template: {
      alwaysHide: false,
      showOrHide: 'show_when',
      hideBranding: false,
      showQuizScore: false,
      showCheckoutDetails: false,
      showSchedulingDetails: false,
      richTitleText: pStr('Thank you'),
      richSubtitleText: pStr(''),
      showOrHideCondition: emptyCondition(),
    },
  };
}

export const filloutAdapter: FormAdapter = {
  name: 'Fillout (SF.gov)',
  fileExtension: 'json',
  mimeType: 'application/json',

  transform(questions: Question[], meta: FormMeta): FilloutExport {
    const formStepId = `page_${nanoid(4)}`;
    const endingStepId = `end_${nanoid(4)}`;

    const widgets: Record<string, FilloutWidget> = {};
    questions.forEach((q, i) => {
      const w = buildWidget(q, i);
      widgets[w.id] = w;
    });

    const button = buildButton(questions.length, endingStepId);
    widgets[button.id] = button;

    const thankYou = buildThankYou();

    return {
      ___FILLOUT_EXPORT_VERSION___: 2,
      template: {
        steps: {
          [formStepId]: {
            id: formStepId,
            name: meta.formTitle || 'Page 1',
            type: 'form',
            nextStep: { isFinal: false, branches: [], defaultNextStep: endingStepId },
            position: { x: 0, y: 0 },
            template: { widgets },
          },
          [endingStepId]: {
            id: endingStepId,
            name: 'Ending',
            type: 'ending',
            nextStep: { isFinal: true, branches: [], defaultNextStep: '' },
            template: {
              type: 'thank_you',
              confetti: true,
              widgets: { [thankYou.id]: thankYou },
            },
          },
        },
        quizzes: {
          answers: {},
          enabled: false,
          settings: { disableShowingCorrectAnswers: false },
        },
        settings: {},
        firstStep: formStepId,
        urlParams: [],
        calculations: {},
        integrations: {},
        themePublicId: SF_GOV_THEME_PUBLIC_ID,
      },
      settings: {},
      theme: SF_GOV_THEME,
      workflows: [],
      type: 'form',
    };
  },
};
