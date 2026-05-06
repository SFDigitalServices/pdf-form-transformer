import { test, expect } from '@playwright/test';

test('home page loads with correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/PDF.*Digital Form Transformer/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('PDF');
});
