'use client';

import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FileUploader } from '@/components/FileUploader';
import { FormTitleInput } from '@/components/FormTitleInput';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { QuestionReviewTable } from '@/components/QuestionReviewTable';
import { ActionBar } from '@/components/ActionBar';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useQuestionList } from '@/hooks/useQuestionList';
import { filloutAdapter } from '@/lib/adapters/sf-internal';
import { downloadJson } from '@/lib/download';

export default function Home() {
  const { state, upload, reset } = useFileUpload();
  const { questions, loadQuestions, addQuestion, updateQuestion, deleteQuestion, reorderQuestions } =
    useQuestionList();
  const [formTitle, setFormTitle] = useState('');
  const [copied, setCopied] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (state.status === 'success') {
      loadQuestions(state.result.questions);
      const derived = state.sourceFilename
        .replace(/\.pdf$/i, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      setFormTitle(state.result.title?.trim() || derived);
      const n = state.result.questions.length;
      setAnnouncement(
        `${n} question${n !== 1 ? 's' : ''} extracted from ${state.sourceFilename}.`,
      );
    }
    if (state.status === 'idle') {
      setManualMode(false);
      setAnnouncement('');
    }
  }, [state.status]); // eslint-disable-line react-hooks/exhaustive-deps

  function buildExport() {
    return filloutAdapter.transform(questions, {
      sourceFilename:
        state.status === 'success' ? state.sourceFilename : 'manual-entry.pdf',
      formTitle: formTitle.trim() || 'Untitled Form',
    });
  }

  function handleGenerate() {
    const json = buildExport();
    const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    downloadJson(json, `sf-form-export-${ts}.json`);
  }

  async function handleCopy() {
    const json = buildExport();
    await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const showEditor = state.status === 'success' || manualMode;

  return (
    <ErrorBoundary>
      {/* ARIA live region for screen-reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0b0c0c] mb-3 leading-tight">
            Turn your PDF into a Digital Form
          </h1>
          <p className="text-[#535454] text-base sm:text-lg max-w-2xl">
            Upload a City and County of San Francisco PDF form to extract its questions and
            generate a Fillout-compatible JSON file.
          </p>
        </div>

        {/* Upload / error state */}
        {!showEditor && (
          <>
            {(state.status === 'idle' || state.status === 'uploading') && (
              <FileUploader onUpload={upload} isUploading={state.status === 'uploading'} />
            )}

            {state.status === 'uploading' && <SkeletonLoader />}

            {state.status === 'error' && (
              <div className="space-y-4">
                <div
                  role="alert"
                  className="border border-[#ac0000] bg-red-50 rounded p-4 text-sm text-[#ac0000]"
                >
                  {state.message}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={reset}
                    className="h-9 px-4 bg-[#1b519e] text-white rounded text-sm font-medium hover:bg-[#001d4e] focus:outline-none focus:ring-2 focus:ring-[#1b519e] focus:ring-offset-1"
                  >
                    Try again
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualMode(true)}
                    className="h-9 px-4 border border-gray-300 text-[#535454] rounded text-sm font-medium hover:border-[#1b519e] hover:text-[#1b519e] focus:outline-none focus:ring-2 focus:ring-[#1b519e] focus:ring-offset-1"
                  >
                    Enter questions manually
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Editor: shown after extraction OR in manual mode */}
        {showEditor && (
          <div className="space-y-4">
            {state.status === 'success' && state.result.warning && (
              <div
                role="alert"
                className="border border-[#0046c2] bg-[#e5f1ff] rounded p-4 text-sm text-[#0b0c0c]"
              >
                <strong>Note:</strong> {state.result.warning} You may need to review and fill in
                some fields manually.
              </div>
            )}

            {manualMode && state.status !== 'success' && (
              <div className="border border-[#0046c2] bg-[#e5f1ff] rounded p-4 text-sm text-[#0b0c0c]">
                Adding questions manually. Use &ldquo;+ Add Question&rdquo; below to build your
                form.
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#0b0c0c]">
                {questions.length} question{questions.length !== 1 ? 's' : ''}
                {state.status === 'success' ? ' extracted' : ''}
              </p>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setManualMode(false);
                }}
                className="text-sm text-[#2a60af] underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-[#1b519e] focus:ring-offset-1 rounded"
              >
                Start over
              </button>
            </div>

            <FormTitleInput value={formTitle} onChange={setFormTitle} />

            <QuestionReviewTable
              questions={questions}
              onUpdate={updateQuestion}
              onDelete={deleteQuestion}
              onReorder={reorderQuestions}
            />

            <ActionBar
              questionCount={questions.length}
              onAdd={addQuestion}
              onGenerate={handleGenerate}
              onCopy={handleCopy}
              copied={copied}
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
