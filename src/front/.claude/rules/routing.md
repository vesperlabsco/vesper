# Routing (TanStack Router)

- File-based routing sous `routes/`. Ne jamais éditer `routeTree.gen.ts` à la main.
- `routeTree.gen.ts` est **commit** (pas dans `.gitignore`), même si généré : `npm run build` fait `tsc -b && vite build`, et `tsc -b` type-checke `app/router.tsx` (qui importe `routeTree.gen.ts`) _avant_ que Vite n'ait eu l'occasion de le (re)générer. Sans le fichier commité, un clone frais casserait au premier build.
- Plugin Vite `@tanstack/router-plugin` (cible `react`, `autoCodeSplitting: true`) : doit tourner **avant** `@vitejs/plugin-react` dans `vite.config.ts` (exigence documentée par TanStack Router).
- Chaque fichier de route exporte à la fois `Route` (`createFileRoute`/`createRootRoute`) et son composant — c'est le pattern attendu par la lib, pas une violation de Fast Refresh. `react-refresh/only-export-components` est donc désactivée spécifiquement sur `src/routes/**/*.tsx` (voir `eslint.config.js`), pas ailleurs.
- Chaque espace (`org-admin`, `clinic-admin/$clinicId`, `app`) a un `route.tsx` qui pose le layout ET le guard via `beforeLoad`. Exemple concret en place : `routes/app/route.tsx` redirige vers `/` si `useSessionStore.getState().isAuthenticated` est faux — toutes les routes sous `app/` (ex. `routes/app/star-wars.tsx`) en héritent automatiquement, pas besoin de répéter le guard par page. `useSessionStore` (`shared/stores/`) est un **mock en mémoire** (pas de vraie auth backend) : un bouton "Simulate login" dans `__root.tsx` bascule le flag, à remplacer par un vrai `AuthProvider` quand le backend exposera une session.
- Les routes publiques (login, register, forgot-password) vivent sous `_public/` (préfixe `_` = pathless layout, n'apparaît pas dans l'URL).
- Les segments dynamiques suivent la convention TanStack (`$clinicId`, `$userId`).
- Pas de coverage unitaire attendu sur `routes/**` (cf. `quality-checks.md`) — validé via Playwright (`e2e/index.spec.ts`, `e2e/star-wars.spec.ts`).
