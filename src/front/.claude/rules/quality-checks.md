# Lint & tests

Voir [[docker.md]] pour le principe : toute commande ci-dessous s'exécute dans le conteneur (via la cible `make` associée une fois qu'elle existe).

## Linter

- Le linter tourne **à la fin de chaque prompt**, avant de considérer la tâche terminée — pas seulement à la fin du ticket.
- Corriger les erreurs de lint soi-même plutôt que de les laisser pour plus tard ou de les signaler sans agir.
- Ne jamais désactiver une règle de lint (`eslint-disable`, etc.) pour faire passer le linter sans avoir traité la cause réelle ; si une règle est vraiment inadaptée à un cas précis, le dire explicitement plutôt que de la contourner silencieusement.

## Tests unitaires

- S'assurer que les tests unitaires passent **au fur et à mesure**, pas seulement en fin de ticket : après avoir touché une feature, relancer (au minimum) les tests unitaires concernés avant de continuer.
- Toute logique nouvelle ou modifiée dans `features/**` doit avoir (ou garder) une couverture de test unitaire à jour.
- Un test unitaire qui casse suite à un changement se corrige immédiatement, il ne se laisse pas rouge "pour plus tard".

## Tests Playwright (e2e)

- Ne pas obligatoirement relancer la suite Playwright complète à chaque petite modification (trop coûteux) — mais elle doit être lancée et **verte au minimum à la fin du ticket**, avant de le considérer terminé.
- Si le ticket touche un parcours utilisateur existant couvert par Playwright, vérifier/mettre à jour le scénario correspondant.
- Si le ticket introduit un nouveau parcours utilisateur significatif, ajouter le scénario Playwright correspondant plutôt que de s'appuyer uniquement sur les tests unitaires.

## Ordre de priorité en cas de temps contraint

1. Lint propre
2. Tests unitaires verts
3. Tests Playwright verts (au minimum en fin de ticket)

Ne jamais rendre un ticket "terminé" avec un lint ou des tests unitaires rouges.
