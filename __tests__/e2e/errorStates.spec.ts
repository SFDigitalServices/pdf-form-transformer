import { test, expect } from '@playwright/test';

const PDF_BUFFER = Buffer.from('%PDF-1.4 minimal test content');

test('non-PDF file shows client-side error without hitting the API', async ({ page }) => {
  let apiCalled = false;
  page.on('request', (req) => {
    if (req.url().includes('/api/extract')) apiCalled = true;
  });

  await page.goto('/');

  const input = page.locator('input[type="file"]');
  await input.setInputFiles({
    name: 'doc.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: Buffer.from('PK fake docx'),
  });

  await expect(page.getByRole('alert')).toContainText(/only pdf/i);
  expect(apiCalled).toBe(false);
});

test('API 500 error shows error message and manual entry button', async ({ page }) => {
  await page.route('**/api/extract', (route) => {
    route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Internal server error' }) });
  });

  await page.goto('/');

  const input = page.locator('input[type="file"]');
  await input.setInputFiles({ name: 'form.pdf', mimeType: 'application/pdf', buffer: PDF_BUFFER });
  await page.getByRole('button', { name: /extract questions/i }).click();

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: /enter questions manually/i })).toBeVisible();
});

test('API 429 rate limit shows rate limit message', async ({ page }) => {
  await page.route('**/api/extract', (route) => {
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Too many requests. Please try again in 15 minutes.' }),
    });
  });

  await page.goto('/');

  const input = page.locator('input[type="file"]');
  await input.setInputFiles({ name: 'form.pdf', mimeType: 'application/pdf', buffer: PDF_BUFFER });
  await page.getByRole('button', { name: /extract questions/i }).click();

  await expect(page.getByRole('alert')).toContainText(/too many requests/i);
});

test('manual entry mode lets users add and download questions without extraction', async ({
  page,
}) => {
  await page.route('**/api/extract', (route) => {
    route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Service unavailable' }) });
  });

  await page.goto('/');

  const input = page.locator('input[type="file"]');
  await input.setInputFiles({ name: 'form.pdf', mimeType: 'application/pdf', buffer: PDF_BUFFER });
  await page.getByRole('button', { name: /extract questions/i }).click();

  await page.getByRole('button', { name: /enter questions manually/i }).click();

  await expect(page.getByText(/no questions yet/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /add question/i })).toBeVisible();

  await page.getByRole('button', { name: /add question/i }).click();
  await expect(page.getByLabel('Question text')).toBeVisible();
});
