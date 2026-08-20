# vesper — backend

Backend FastAPI de vesper, organisé par domaine métier (vertical slices) sous `src/app/domains/`, avec une API versionnée sous `/api/v1`, elle-même séparée en routes `public` (sans authentification) et `private` (authentifiées). Le projet est destiné à tourner sous Docker (voir `docker-workflow.md`) et utilise `uv` pour la gestion des dépendances et l'exécution des tâches (lint, tests).

Règles détaillées :

@.claude/rules/architecture.md
@.claude/rules/identifiers.md
@.claude/rules/naming-typing.md
@.claude/rules/testing.md
@.claude/rules/linting-formatting.md
@.claude/rules/docker-workflow.md
