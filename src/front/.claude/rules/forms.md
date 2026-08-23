# Formulaires & validation

## Stack

- **Gestion d'état des formulaires**: TanStack Form.
- **Validation / schémas**: Zod — Zod est la **source de vérité** pour la forme des données (pas de backend à contrat typé pour l'instant type OpenAPI/tRPC). Si un contrat typé backend arrive plus tard, revoir cette règle plutôt que de faire coexister les deux approches.

## Où vivent les schémas

- `features/<feature>/schemas.ts` : les schémas Zod de la feature (source de vérité). Un seul fichier tant que la feature reste simple ; si ça grossit, éclater en `features/<feature>/schemas/<entity>.ts` (même logique que pour `api/`, `components/` : on découpe seulement quand la taille le justifie, pas par anticipation).
- `features/<feature>/types.ts` : ne contient **pas** de types écrits à la main en doublon des schémas. Il ré-exporte les types dérivés via `z.infer<typeof xxxSchema>`. S'il n'y a rien à ajouter au-delà de l'inférence, `types.ts` peut ne faire que ça.

## Convention de nommage des schémas

| Rôle                                                | Convention             | Exemple                      |
| --------------------------------------------------- | ---------------------- | ---------------------------- |
| Schéma d'entité complet (tel que renvoyé par l'API) | `<entity>Schema`       | `userSchema`, `clinicSchema` |
| Schéma de saisie formulaire (création)              | `create<Entity>Schema` | `createUserSchema`           |
| Schéma de saisie formulaire (édition)               | `update<Entity>Schema` | `updateUserSchema`           |

Les schémas de saisie se **dérivent** du schéma d'entité via `.pick()` / `.omit()` / `.partial()` / `.extend()` — on ne réécrit jamais à la main un schéma qui duplique des champs déjà définis dans `<entity>Schema`.

## Validation à la frontière API

- Toute réponse API est validée à l'exécution avec le schéma correspondant (`schema.parse()` ou `.safeParse()`) dans `features/*/api/`, avant que la donnée n'entre dans le cache TanStack Query. Jamais de `as User` pour caster un JSON brut sans validation réelle.
- Objectif : une dérive du contrat backend casse immédiatement (erreur de parsing explicite), plutôt que de propager une donnée mal formée silencieusement dans l'app.

## Formulaires

- Chaque formulaire est branché sur son schéma Zod (`create<Entity>Schema` / `update<Entity>Schema`) via le validator Zod de TanStack Form — jamais de règles de validation écrites à la main dans le composant (pas de `if (!value) setError(...)` manuel).
- L'affichage des erreurs de champ passe par l'état d'erreur exposé par TanStack Form, pas par un `useState` local parallèle.
- **Fiches cliniques configurables (`clinic-admin/forms`)** : la définition des champs d'une fiche est dynamique (elle vient de la config, pas codée en dur). Le schéma Zod correspondant se **construit programmatiquement** à partir de cette config (ex: `z.object(Object.fromEntries(fields.map(...)))`), il ne s'écrit pas à la main par fiche. Le principe "Zod = source de vérité" s'applique aussi à ce schéma généré.
