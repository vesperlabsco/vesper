import { test, expect } from '@playwright/test';

test.describe('Star Wars page (espace app, protégé)', () => {
  test('redirige vers l’accueil si non authentifié', async ({ page }) => {
    await page.goto('/app/star-wars');

    await expect(page).toHaveURL('/');
  });

  test('accessible après simulation de connexion, affiche les personnages', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Simulate login' }).click();
    await page.getByRole('link', { name: 'Star Wars' }).click();

    await expect(page).toHaveURL('/app/star-wars');
    await expect(page.getByRole('heading', { name: 'Star Wars characters' })).toBeVisible();
    await expect(page.getByText('Luke Skywalker')).toBeVisible({ timeout: 10000 });
  });
});
