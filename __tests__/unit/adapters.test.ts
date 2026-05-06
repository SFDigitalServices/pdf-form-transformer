import { describe, it, expect } from 'vitest';
import { filloutAdapter } from '@/lib/adapters/sf-internal';
import type { Question } from '@/lib/types';
import type { FilloutExport, FilloutFormStep } from '@/lib/adapters/fillout-types';

const meta = { sourceFilename: 'test.pdf', formTitle: 'Test Form' };

function getFormStep(result: FilloutExport): FilloutFormStep {
  const step = Object.values(result.template.steps).find(s => s.type === 'form');
  if (!step) throw new Error('No form step found');
  return step as FilloutFormStep;
}

describe('filloutAdapter.transform', () => {
  it('returns ___FILLOUT_EXPORT_VERSION___ 2', () => {
    const result = filloutAdapter.transform([], meta) as FilloutExport;
    expect(result.___FILLOUT_EXPORT_VERSION___).toBe(2);
  });

  it('has one form step and one ending step', () => {
    const result = filloutAdapter.transform([], meta) as FilloutExport;
    const steps = Object.values(result.template.steps);
    expect(steps.filter(s => s.type === 'form')).toHaveLength(1);
    expect(steps.filter(s => s.type === 'ending')).toHaveLength(1);
  });

  it('firstStep points to the form step', () => {
    const result = filloutAdapter.transform([], meta) as FilloutExport;
    const formStep = getFormStep(result);
    expect(result.template.firstStep).toBe(formStep.id);
  });

  it('ShortAnswer widget wraps label in pickerString structure', () => {
    const questions: Question[] = [
      { id: 'q1', text: 'Your full name', type: 'short_text', required: true },
    ];
    const result = filloutAdapter.transform(questions, meta) as FilloutExport;
    const formStep = getFormStep(result);
    const widget = formStep.template.widgets['q1'];

    expect(widget.type).toBe('ShortAnswer');
    expect((widget.template.label as { ___LOGIC_TYPE___: string }).___LOGIC_TYPE___).toBe('pickerString');
    expect((widget.template.label as { logic: { value: string } }).logic.value).toContain('Your full name');
  });

  it('required field is set correctly on widgets', () => {
    const questions: Question[] = [
      { id: 'q1', text: 'Name', type: 'short_text', required: true },
      { id: 'q2', text: 'Notes', type: 'long_text', required: false },
    ];
    const result = filloutAdapter.transform(questions, meta) as FilloutExport;
    const formStep = getFormStep(result);

    expect((formStep.template.widgets['q1'].template.required as { logic: boolean }).logic).toBe(true);
    expect((formStep.template.widgets['q2'].template.required as { logic: boolean }).logic).toBe(false);
  });

  it('yes_no generates MultipleChoice with Yes and No options', () => {
    const questions: Question[] = [
      { id: 'q1', text: 'Are you a resident?', type: 'yes_no', required: false },
    ];
    const result = filloutAdapter.transform(questions, meta) as FilloutExport;
    const formStep = getFormStep(result);
    const widget = formStep.template.widgets['q1'];

    expect(widget.type).toBe('MultipleChoice');
    const opts = (widget.template.options as { staticOptions: { value: { logic: { value: string } } }[] }).staticOptions;
    const values = opts.map(o => o.value.logic.value);
    expect(values).toContain('Yes');
    expect(values).toContain('No');
  });

  it('multiple_choice uses provided options', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        text: 'Preferred contact',
        type: 'multiple_choice',
        required: false,
        options: ['Phone', 'Email', 'Mail'],
      },
    ];
    const result = filloutAdapter.transform(questions, meta) as FilloutExport;
    const formStep = getFormStep(result);
    const opts = (formStep.template.widgets['q1'].template.options as { staticOptions: { value: { logic: { value: string } } }[] }).staticOptions;
    expect(opts.map(o => o.value.logic.value)).toEqual(['Phone', 'Email', 'Mail']);
  });

  it('statement maps to Paragraph using contents key', () => {
    const questions: Question[] = [
      { id: 'q1', text: 'Please read carefully.', type: 'statement', required: false },
    ];
    const result = filloutAdapter.transform(questions, meta) as FilloutExport;
    const formStep = getFormStep(result);
    const widget = formStep.template.widgets['q1'];

    expect(widget.type).toBe('Paragraph');
    expect(widget.template.contents).toBeDefined();
    expect(widget.template.label).toBeUndefined();
  });

  it('empty questions produces only a Button widget in the form step', () => {
    const result = filloutAdapter.transform([], meta) as FilloutExport;
    const formStep = getFormStep(result);
    const widgets = Object.values(formStep.template.widgets);

    expect(widgets).toHaveLength(1);
    expect(widgets[0].type).toBe('Button');
  });

  it('includes SF.gov themePublicId', () => {
    const result = filloutAdapter.transform([], meta) as FilloutExport;
    expect(result.template.themePublicId).toBe('2fb883bc-94c7-4c86-b46b-fab8d7fd649b');
  });
});
