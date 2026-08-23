import { defineConfig, devices } from '@playwright/test';

// Le serveur de dev Vite tourne déjà en permanence dans le conteneur (piloté
// par supervisord, voir docker/front/supervisor/ihm.conf) — inutile de le
// redémarrer ici via `webServer`.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
