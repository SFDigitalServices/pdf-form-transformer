import { test, expect } from '@playwright/test';

test('no horizontal overflow at 375×812 mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test('no horizontal overflow with manual entry table at 375px', async ({ page }) => {
  await page.route('**/api/extract', (route) => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'error' }),
    });
  });

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  const input = page.locator('input[type="file"]');
  await input.setInputFiles({
    name: 'form.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test'),
  });
  await page.getByRole('button', { name: /extract questions/i }).click();
  await page.getByRole('button', { name: /enter questions manually/i }).click();
  await page.getByRole('button', { name: /add question/i }).click();

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});
