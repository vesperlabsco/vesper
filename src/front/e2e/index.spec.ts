import { test, expect } from '@playwright/test';

test.describe('App', () => {
  test('affiche le titre et incrémente le compteur', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Get started' })).toBeVisible();

    const button = page.getByRole('button', { name: 'Count is 0' });
    await button.click();

    await expect(page.getByRole('button', { name: 'Count is 1' })).toBeVisible();
  });
});
