# Routing (TanStack Router)

- File-based routing sous `routes/`. Ne jamais éditer `routeTree.gen.ts` à la main.
- Chaque espace (`org-admin`, `clinic-admin/$clinicId`, `app`) a un `route.tsx` qui pose le layout ET le guard via `beforeLoad`.
- Les routes publiques (login, register, forgot-password) vivent sous `_public/` (préfixe `_` = pathless layout, n'apparaît pas dans l'URL).
- Les segments dynamiques suivent la convention TanStack (`$clinicId`, `$userId`).
