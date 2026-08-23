# Convention de nommage des fichiers

| Type                                | Convention                           | Exemple                                         |
| ----------------------------------- | ------------------------------------ | ----------------------------------------------- |
| Composants React (fichier + export) | PascalCase                           | `UserList.tsx`, `ClinicUserForm.tsx`            |
| Hooks                               | camelCase, préfixe `use`             | `useOrgUsers.ts`, `useClinicUserDetail.ts`      |
| Utilitaires / lib / helpers         | camelCase                            | `apiClient.ts`, `formatDate.ts`                 |
| Fichiers de types purs              | camelCase ou `PascalCase.types.ts`   | `types.ts`, `User.types.ts`                     |
| Dossiers (features, modules)        | kebab-case                           | `org-admin/`, `clinic-users/`                   |
| Routes TanStack Router              | kebab-case (imposé par le router)    | `routes/clinic-admin/$clinicId/users/index.tsx` |
| Fichiers de config                  | kebab-case ou standard de l'outil    | `vite.config.ts`, `i18n.ts`                     |
| Fichiers de traduction i18n         | kebab-case                           | `clinic-admin.json`, `common.json`              |
| Tests                               | nom du fichier testé + `.test.ts(x)` | `UserList.test.tsx`                             |

Un composant exporte un seul composant principal du même nom que le fichier. Pas de `index.tsx` pour un composant (uniquement pour les barrels ou les routes file-based).

## Emplacement des tests unitaires

Les tests unitaires sont colocalisés à plat, directement à côté du fichier testé — pas de dossier `__test__/`.

```
features/users/components/
├── UserList.tsx
└── UserList.test.tsx
```

Cette règle s'applique partout où il y a des tests unitaires (`features/**`, `shared/**`, etc.).
