# Stack & espaces applicatifs

## Stack

- **Build**: Vite
- **Routing**: TanStack Router, file-based (`routeTree.gen.ts` généré — ne jamais l'éditer à la main)
- **Data fetching / cache serveur**: TanStack Query
- **État client global** (session, org/clinic active): Zustand — uniquement pour de l'état client, jamais pour du cache serveur (ça, c'est le rôle de Query)
- **Formulaires / validation**: TanStack Form + Zod (Zod = source de vérité des types et de la validation, y compris à la frontière API) — détail dans [[forms.md]]
- **i18n**: fichiers JSON par espace, un dossier par langue

## Les 3 espaces

L'app a trois espaces distincts, chacun avec son propre guard de rôle/scope au niveau du layout de route :

| Espace            | Route racine                     | Rôle requis             | Scope                 |
| ----------------- | -------------------------------- | ----------------------- | --------------------- |
| Organisation      | `routes/org-admin/`              | `org_admin`             | organisation courante |
| Clinique          | `routes/clinic-admin/$clinicId/` | `clinic_admin`          | `clinicId` de l'URL   |
| Utilisateur final | `routes/app/`                    | utilisateur authentifié | —                     |

Le guard (vérification rôle + scope) vit dans le `beforeLoad` du `route.tsx` de chaque espace, jamais dispersé dans les pages enfants. Ne jamais dupliquer la logique de guard entre `org-admin` et `clinic-admin` : factoriser dans `shared/permissions/`.
