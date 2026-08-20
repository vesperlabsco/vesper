# Style de code

- TypeScript strict, pas de `any` implicite. Un `unknown` + narrowing plutôt qu'un `any` de confort.
- Pas de commentaire qui répète ce que le code dit déjà. Un commentaire seulement pour une contrainte cachée ou un choix non évident.
- Pas d'abstraction avant d'avoir au moins 2-3 usages réels du pattern.

## Alias de chemin

- Alias unique `@/` → `src/`, configuré à la fois dans `tsconfig.json` (`compilerOptions.paths`) et `vite.config.ts` (`resolve.alias`) — les deux doivent rester synchronisés.
- Import relatif (`./`, `../`) autorisé uniquement à l'intérieur d'une même feature/dossier (ex: un composant qui importe un hook du même `features/<x>/`). Dès qu'un import traverse une frontière (`features/` → `shared/`, une feature vers une autre, `routes/` → `features/`...), il passe par l'alias `@/`.
- Jamais de `../../../` (deux niveaux ou plus) : c'est le signal qu'il faut utiliser l'alias `@/` à la place.
