# Architecture & arborescence

Projet pas encore initialisé. Tant que `package.json` / `src/` n'existent pas, la priorité est de scaffolder Vite puis de mettre en place l'arborescence ci-dessous — ne pas dévier de la structure sans en discuter.

## Arborescence cible

```
src/
├── main.tsx
├── app/
│   ├── router.tsx
│   ├── routeTree.gen.ts           # généré, ne pas éditer
│   └── providers/
│       ├── QueryProvider.tsx
│       ├── I18nProvider.tsx
│       └── AuthProvider.tsx
│
├── routes/                        # file-based routing
│   ├── __root.tsx
│   ├── _public/                   # login, register, forgot-password
│   ├── org-admin/                 # guard: org_admin
│   ├── clinic-admin/$clinicId/    # guard: clinic_admin, scope clinicId
│   └── app/                       # espace utilisateur final
│
├── features/                      # logique métier, vertical slices
│   └── <feature>/
│       ├── api/                   # queries/mutations TanStack Query
│       ├── hooks/
│       ├── components/
│       └── types.ts
│
├── shared/
│   ├── ui/                        # design system pur (pas de logique métier)
│   ├── components/                # composites cross-feature
│   ├── hooks/
│   ├── lib/
│   ├── stores/                    # zustand
│   └── permissions/                # can(), hasRole(), guards partagés
│
├── locales/
│   ├── i18n.ts
│   ├── en/{common,org-admin,clinic-admin,app}.json
│   └── fr/{common,org-admin,clinic-admin,app}.json
│
└── config/
    ├── env.ts
    └── roles.ts
```

## Règles

- **`routes/` reste fin.** Une route importe et compose des éléments de `features/`, elle n'implémente pas de logique métier. Le fichier de route gère : guard (`beforeLoad`), loader, composition de composants `features/`.
- **`features/` = vertical slices.** Chaque feature est autonome (`api/`, `hooks/`, `components/`, `types.ts`). Une feature ne dépend pas d'une autre feature — si deux features ont besoin du même code, ce code monte dans `shared/`.
- **Composants scope-agnostic.** Un composant réutilisé entre `org-admin` et `clinic-admin` (ex: `UserList`) reste générique et reçoit le scope (org/clinic) en props. Il ne connaît jamais son espace appelant.
- **`shared/ui/` = design system pur.** Aucune logique métier, aucun appel API, aucun import de `features/`.
- **Cache serveur vs état client.** Toute donnée qui vient de l'API passe par TanStack Query (`features/*/api/`). Zustand (`shared/stores/`) ne stocke que de l'état purement client (session courante, org/clinic active, préférences UI).
- **Pas de fetch direct dans les composants.** Tout accès réseau passe par une query/mutation définie dans `features/*/api/`, elle-même construite sur `shared/lib/api-client.ts`.
- **`useQuery`/`useMutation` jamais inline.** Aucun appel direct à `useQuery`/`useMutation` dans un composant, une route ou un hook de `features/*/hooks/` — ils sont toujours encapsulés dans un hook nommé et exporté depuis `features/*/api/` (ex: `useOrgUsers.ts` dans `features/organizations/api/`), que le composant se contente d'appeler. `features/*/hooks/` sert à de la logique dérivée (état local, combinaison de plusieurs queries, etc.), pas à déclarer des queries.
- **Permissions centralisées.** Toute vérification de rôle/permission passe par `shared/permissions/`, jamais par des `if (role === '...')` ad hoc dans les composants.
