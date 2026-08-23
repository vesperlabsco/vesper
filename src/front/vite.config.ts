import { defineConfig, type UserConfig } from 'vite';
import { coverageConfigDefaults } from 'vitest/config';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  // `vitest/config`'s defineConfig would type-check this key natively, but it
  // bundles its own (older, non-rolldown) vite copy whose Plugin types clash
  // with this project's rolldown-vite — so `test` is typed via a plain cast
  // instead. Vitest still reads this key fine at runtime (types are erased).
  test: {
    environment: 'jsdom',
    setupFiles: './src/vitest.setup.ts',
    include: ['src/**/__test__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Le coverage ne porte que sur le code "logique" (hooks, lib, api,
      // stores, permissions, schemas...) : les composants/UI/routes sont
      // couverts par Playwright (e2e), pas par des tests unitaires — cf.
      // architecture.md ("routes reste fin, pas de logique métier") et
      // quality-checks.md. App.tsx est l'unique composant actuel, exclu pour
      // la même raison.
      exclude: [
        ...coverageConfigDefaults.exclude,
        'src/main.tsx',
        'src/App.tsx',
        'src/**/routes/**',
        'src/**/components/**',
        'src/**/ui/**',
        'src/**/app/providers/**',
      ],
    },
  },
} as UserConfig);
