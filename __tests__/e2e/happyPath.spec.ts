import { test, expect } from '@playwright/test';
import * as fs from 'fs';

const PDF_BUFFER = Buffer.from('%PDF-1.4 minimal test content');

const MOCK_QUESTIONS = [
  { id: 'q1', text: 'Full Name', type: 'short_text', required: true },
  { id: 'q2', text: 'Email Address', type: 'email', required: true },
  {
    id: 'q3',
    text: 'Preferred Contact Method',
    type: 'multiple_choice',
    required: false,
    options: ['Phone', 'Email', 'Mail'],
  },
];

test('upload PDF → questions populate → download valid Fillout JSON', async ({ page }) => {
  await page.route('**/api/extract', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ questions: MOCK_QUESTIONS }),
    });
  });

  await page.goto('/');

  await page.locator('input[type="file"]').setInputFiles({
    name: 'sf-housing-form.pdf',
    mimeType: 'application/pdf',
    buffer: PDF_BUFFER,
  });
  await page.getByRole('button', { name: /extract questions/i }).click();

  await expect(page.getByText('3 questions extracted')).toBeVisible();
  await expect(page.getByLabel('Question text').first()).toHaveValue('Full Name');
  await expect(page.getByLabel('Form title')).toHaveValue('sf housing form');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /generate json/i }).click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/^sf-form-export-.+\.json$/);

  const downloadPath = await download.path();
  const content = JSON.parse(fs.readFileSync(downloadPath!, 'utf-8'));

  expect(content.___FILLOUT_EXPORT_VERSION___).toBe(2);
  expect(Object.keys(content.template.steps).length).toBeGreaterThan(0);
});

test('Copy JSON button writes valid Fillout JSON to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await page.route('**/api/extract', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ questions: MOCK_QUESTIONS }),
    });
  });

  await page.goto('/');

  await page.locator('input[type="file"]').setInputFiles({
    name: 'form.pdf',
    mimeType: 'application/pdf',
    buffer: PDF_BUFFER,
  });
  await page.getByRole('button', { name: /extract questions/i }).click();
  await expect(page.getByText('3 questions extracted')).toBeVisible();

  await page.getByRole('button', { name: /copy json/i }).click();
  await expect(page.getByRole('button', { name: /copied!/i })).toBeVisible();

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  const json = JSON.parse(clipboardText);
  expect(json.___FILLOUT_EXPORT_VERSION___).toBe(2);
});

test('Start over resets to upload state', async ({ page }) => {
  await page.route('**/api/extract', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ questions: MOCK_QUESTIONS }),
    });
  });

  await page.goto('/');

  await page.locator('input[type="file"]').setInputFiles({
    name: 'form.pdf',
    mimeType: 'application/pdf',
    buffer: PDF_BUFFER,
  });
  await page.getByRole('button', { name: /extract questions/i }).click();
  await expect(page.getByText('3 questions extracted')).toBeVisible();

  await page.getByRole('button', { name: /start over/i }).click();
  await expect(page.getByRole('button', { name: /extract questions/i })).toBeVisible();
});
