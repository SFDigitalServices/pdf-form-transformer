'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { type Question } from '@/lib/types';
import { QuestionRow } from './QuestionRow';

interface Props {
  questions: Question[];
  onUpdate: (id: string, changes: Partial<Omit<Question, 'id'>>) => void;
  onDelete: (id: string) => void;
  onReorder: (questions: Question[]) => void;
}

export function QuestionReviewTable({ questions, onUpdate, onDelete, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      onReorder(arrayMove(questions, oldIndex, newIndex));
    }
  }

  if (questions.length === 0) {
    return (
      <p className="text-center text-[#535454] py-10 border-2 border-dashed border-gray-200 rounded">
        No questions yet — add one below or upload a PDF.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2" role="list" aria-label="Form questions">
          {questions.map((q) => (
            <div key={q.id} role="listitem">
              <QuestionRow question={q} onUpdate={onUpdate} onDelete={onDelete} />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
