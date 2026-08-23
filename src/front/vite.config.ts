import { defineConfig, type UserConfig } from 'vite';
import { coverageConfigDefaults } from 'vitest/config';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Doit tourner avant @vitejs/plugin-react (exigence documentée de TanStack
    // Router) : il génère routeTree.gen.ts à partir de src/routes/ avant que
    // React ne transforme le JSX.
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/app/routeTree.gen.ts',
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
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
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Le coverage ne porte que sur le code "logique" (hooks, lib, api,
      // stores, permissions, schemas...) : les composants/UI/routes sont
      // couverts par Playwright (e2e), pas par des tests unitaires — cf.
      // architecture.md ("routes reste fin, pas de logique métier") et
      // quality-checks.md.
      exclude: [
        ...coverageConfigDefaults.exclude,
        'src/main.tsx',
        'src/**/routes/**',
        'src/**/components/**',
        'src/**/ui/**',
        'src/**/app/providers/**',
        'src/app/router.tsx',
        'src/app/routeTree.gen.ts',
      ],
    },
  },
} as UserConfig);
