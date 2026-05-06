'use client';

import { cn } from '@/lib/utils';

interface Props {
  questionCount: number;
  onAdd: () => void;
  onGenerate: () => void;
  onCopy?: () => void;
  copied?: boolean;
}

export function ActionBar({ questionCount, onAdd, onGenerate, onCopy, copied }: Props) {
  const canGenerate = questionCount > 0;

  return (
    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
      <button
        type="button"
        onClick={onAdd}
        className="h-9 px-4 border border-[#1b519e] text-[#1b519e] rounded text-sm font-medium hover:bg-[#e5f1ff] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1b519e] focus:ring-offset-1"
      >
        + Add Question
      </button>

      <div className="flex items-center gap-2">
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            disabled={!canGenerate}
            className={cn(
              'h-9 px-4 border rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1b519e] focus:ring-offset-1',
              canGenerate
                ? 'border-gray-300 text-[#535454] hover:border-[#1b519e] hover:text-[#1b519e]'
                : 'border-gray-200 text-gray-300 cursor-not-allowed',
            )}
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        )}

        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className={cn(
            'h-9 px-4 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1b519e] focus:ring-offset-1',
            canGenerate
              ? 'bg-[#1b519e] text-white hover:bg-[#001d4e]'
              : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed',
          )}
        >
          Generate JSON
        </button>
      </div>
    </div>
  );
}
