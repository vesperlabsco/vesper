# Lint & tests

Voir [[docker.md]] pour le principe : toute commande ci-dessous s'exécute dans le conteneur, via la cible `make` associée.

## Linter

- `make front_lint` (`eslint .`) — fonctionnel dès aujourd'hui.
- Le linter tourne **à la fin de chaque prompt**, avant de considérer la tâche terminée — pas seulement à la fin du ticket.
- Corriger les erreurs de lint soi-même plutôt que de les laisser pour plus tard ou de les signaler sans agir.
- Ne jamais désactiver une règle de lint (`eslint-disable`, etc.) pour faire passer le linter sans avoir traité la cause réelle ; si une règle est vraiment inadaptée à un cas précis, le dire explicitement plutôt que de la contourner silencieusement.

## Tests unitaires

Stack : Vitest + React Testing Library (+ `@testing-library/jest-dom`, `@testing-library/user-event`). `make front_test` lance `vitest run`.

- S'assurer que les tests unitaires passent **au fur et à mesure**, pas seulement en fin de ticket : après avoir touché une feature, relancer (au minimum) les tests unitaires concernés avant de continuer.
- Toute logique nouvelle ou modifiée dans `features/**` doit avoir (ou garder) une couverture de test unitaire à jour.
- Un test unitaire qui casse suite à un changement se corrige immédiatement, il ne se laisse pas rouge "pour plus tard".

### Coverage — ce qui compte, ce qui n'est pas attendu

`npm run test:coverage` (`vitest run --coverage`, provider v8) ne mesure que le code **logique** : `hooks/`, `lib/`, `api/`, `shared/stores/`, `shared/permissions/`, schémas, etc. Sont exclus du calcul (config dans `vite.config.ts`, clé `test.coverage.exclude`) :

- `src/**/components/**` et `src/**/ui/**` — composants React, testés via des scénarios Playwright (parcours utilisateur), pas via une exigence de coverage unitaire.
- `src/**/routes/**` — cf. `architecture.md` : une route reste fine et ne porte pas de logique métier.
- `src/main.tsx` — bootstrap sans logique.

Rien n'empêche d'écrire un test unitaire pour un composant (ex. `App.test.tsx`, qui sert d'exemple) — il tourne toujours dans `make front_test` — mais son absence ne fait pas baisser le coverage, et sa présence ne le fait pas monter : ce n'est pas la métrique pertinente pour ce type de fichier. Si un nouveau dossier logique est ajouté à l'arborescence (voir `architecture.md`) et qu'il ne remonte pas dans le coverage alors qu'il devrait, mettre à jour `exclude` dans `vite.config.ts` plutôt que d'ignorer l'écart.

## Tests Playwright (e2e)

> **[À METTRE À JOUR]** Playwright n'est pas encore ajouté à `package.json` (seule l'infra container — Xvfb/x11vnc/noVNC, voir `docker.md` — est prête à l'accueillir). Une fois installé, ce sera exécuté via `make front_test` (ou une cible dédiée à créer si unitaire et e2e doivent rester séparés) et visible en mode headed sur http://localhost:6080/vnc_auto.html.

- Ne pas obligatoirement relancer la suite Playwright complète à chaque petite modification (trop coûteux) — mais elle doit être lancée et **verte au minimum à la fin du ticket**, avant de le considérer terminé.
- Si le ticket touche un parcours utilisateur existant couvert par Playwright, vérifier/mettre à jour le scénario correspondant.
- Si le ticket introduit un nouveau parcours utilisateur significatif, ajouter le scénario Playwright correspondant plutôt que de s'appuyer uniquement sur les tests unitaires.

## Ordre de priorité en cas de temps contraint

1. Lint propre
2. Tests unitaires verts
3. Tests Playwright verts (au minimum en fin de ticket)

Ne jamais rendre un ticket "terminé" avec un lint rouge, ni des tests unitaires/Playwright rouges une fois ces stacks en place.
