'use client';

import * as Select from '@radix-ui/react-select';
import { type QuestionType } from '@/lib/types';
import { cn } from '@/lib/utils';

const TYPE_LABELS: Record<QuestionType, string> = {
  short_text: 'Short text',
  long_text: 'Long text',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  date: 'Date',
  number: 'Number',
  yes_no: 'Yes / No',
  multiple_choice: 'Multiple choice',
  checkboxes: 'Checkboxes',
  dropdown: 'Dropdown',
  file_upload: 'File upload',
  signature: 'Signature',
  statement: 'Statement',
};

const OPTION_TYPES = new Set<QuestionType>(['multiple_choice', 'checkboxes', 'dropdown']);
export function hasOptions(type: QuestionType): boolean {
  return OPTION_TYPES.has(type);
}

interface Props {
  value: QuestionType;
  onChange: (value: QuestionType) => void;
}

export function TypeDropdown({ value, onChange }: Props) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className="flex items-center gap-1 h-8 px-2 border border-gray-200 rounded text-sm bg-white hover:border-[#1b519e] focus:outline-none focus:ring-2 focus:ring-[#1b519e] focus:ring-offset-1 min-w-[9.5rem]"
        aria-label="Question type"
      >
        <Select.Value />
        <Select.Icon className="ml-auto pl-1 text-gray-400">▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="z-50 bg-white border border-gray-200 rounded shadow-md"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className="p-1">
            {(Object.keys(TYPE_LABELS) as QuestionType[]).map((type) => (
              <Select.Item
                key={type}
                value={type}
                className={cn(
                  'text-sm px-3 py-1.5 rounded cursor-pointer select-none outline-none',
                  'data-[highlighted]:bg-[#e5f1ff] data-[highlighted]:text-[#1b519e]',
                  'data-[state=checked]:font-medium',
                )}
              >
                <Select.ItemText>{TYPE_LABELS[type]}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
