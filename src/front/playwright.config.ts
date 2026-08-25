import { defineConfig, devices } from '@playwright/test';

// Le serveur de dev Vite tourne déjà en permanence dans le conteneur (piloté
// par supervisord, voir docker/front/supervisor/ihm.conf) — inutile de le
// redémarrer ici via `webServer`.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Runner self-hosted à 4 Go de RAM : un seul Chromium à la fois pour éviter
  // l'OOM (2 workers en parallèle doublent la mémoire Chromium). CI (GitHub
  // Actions) définit `CI=true` automatiquement ; en local, on garde le défaut
  // (parallèle sur tous les cœurs).
  workers: process.env.CI ? 1 : undefined,
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
