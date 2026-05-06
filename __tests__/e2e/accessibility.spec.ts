import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PDF_BUFFER = Buffer.from('%PDF-1.4 minimal test content');

function criticalViolations(results: Awaited<ReturnType<AxeBuilder['analyze']>>) {
  return results.violations.filter((v) =>
    ['critical', 'serious'].includes(v.impact ?? ''),
  );
}

test('initial upload page has no critical accessibility violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(criticalViolations(results)).toHaveLength(0);
});

test('error state has no critical accessibility violations', async ({ page }) => {
  await page.route('**/api/extract', (route) => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' }),
    });
  });

  await page.goto('/');
  const input = page.locator('input[type="file"]');
  await input.setInputFiles({ name: 'form.pdf', mimeType: 'application/pdf', buffer: PDF_BUFFER });
  await page.getByRole('button', { name: /extract questions/i }).click();
  await expect(page.getByRole('alert')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(criticalViolations(results)).toHaveLength(0);
});

test('manual entry editing view has no critical accessibility violations', async ({ page }) => {
  await page.route('**/api/extract', (route) => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Service error' }),
    });
  });

  await page.goto('/');
  const input = page.locator('input[type="file"]');
  await input.setInputFiles({ name: 'form.pdf', mimeType: 'application/pdf', buffer: PDF_BUFFER });
  await page.getByRole('button', { name: /extract questions/i }).click();
  await page.getByRole('button', { name: /enter questions manually/i }).click();
  await page.getByRole('button', { name: /add question/i }).click();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(criticalViolations(results)).toHaveLength(0);
});
