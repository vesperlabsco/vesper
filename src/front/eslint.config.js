import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importX from 'eslint-plugin-import-x';
import i18next from 'eslint-plugin-i18next';
import jsonc from 'eslint-plugin-jsonc';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'playwright-report', 'test-results', '**/routeTree.gen.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
      i18next.configs['flat/recommended'],
      eslintConfigPrettier,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
      'import-x/resolver': {
        typescript: {
          project: ['./tsconfig.app.json', './tsconfig.node.json'],
        },
      },
    },
  },
  {
    // Convention TanStack Router (file-based routing) : chaque fichier de
    // route exporte à la fois `Route` et son composant — c'est le pattern
    // documenté et attendu par la lib, pas une vraie violation de Fast
    // Refresh (voir la doc TanStack Router elle-même sur cet override).
    files: ['src/routes/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
      // `redirect()` de TanStack Router (utilisé dans les guards `beforeLoad`)
      // renvoie un objet Redirect fait pour être `throw`, pas une instance
      // d'Error — pattern documenté par la lib, pas une vraie erreur non
      // typée.
      '@typescript-eslint/only-throw-error': 'off',
    },
  },
  ...jsonc.configs['recommended-with-json'],
  ...jsonc.configs.prettier,
  {
    // tsconfig*.json est du JSONC (commentaires autorisés), pas du JSON
    // strict — seule règle du preset ci-dessus incompatible avec ça.
    files: ['**/tsconfig*.json'],
    rules: {
      'jsonc/no-comments': 'off',
    },
  },
]);
