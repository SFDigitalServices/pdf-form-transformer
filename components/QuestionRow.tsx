'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Question } from '@/lib/types';
import { TypeDropdown, hasOptions } from './TypeDropdown';
import { cn } from '@/lib/utils';

interface Props {
  question: Question;
  onUpdate: (id: string, changes: Partial<Omit<Question, 'id'>>) => void;
  onDelete: (id: string) => void;
}

export function QuestionRow({ question, onUpdate, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const optionsText = question.options?.join(', ') ?? '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex flex-col gap-2 p-3 bg-white border border-gray-200 rounded',
        isDragging && 'opacity-50 shadow-lg z-10',
      )}
    >
      {/* Row 1: drag handle + text input */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 focus:outline-none focus:text-gray-500 shrink-0"
          aria-label="Drag to reorder"
        >
          ⠿
        </button>

        <input
          type="text"
          value={question.text}
          onChange={(e) => onUpdate(question.id, { text: e.target.value })}
          placeholder="Question text"
          aria-label="Question text"
          className="flex-1 min-w-0 h-8 px-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1b519e] focus:border-transparent"
        />
      </div>

      {/* Row 2: type + required + delete */}
      <div className="flex items-center gap-2 pl-7">
        <TypeDropdown
          value={question.type}
          onChange={(type) => onUpdate(question.id, { type })}
        />

        <label className="flex items-center gap-1.5 text-sm text-[#535454] cursor-pointer">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => onUpdate(question.id, { required: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          Required
        </label>

        <button
          type="button"
          onClick={() => onDelete(question.id)}
          aria-label="Delete question"
          className="ml-auto text-gray-300 hover:text-[#ac0000] focus:outline-none focus:text-[#ac0000] transition-colors shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Row 3: options (conditional) */}
      {hasOptions(question.type) && (
        <div className="pl-7">
          <input
            type="text"
            value={optionsText}
            onChange={(e) =>
              onUpdate(question.id, {
                options: e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Options (comma-separated, e.g. Yes, No, Maybe)"
            aria-label="Options"
            className="w-full h-8 px-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1b519e] focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
}
