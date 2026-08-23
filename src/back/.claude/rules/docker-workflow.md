---
name: docker-workflow
description: Toutes les commandes (tests, lint, run) passent par le Makefile racine, qui pilote Docker Compose
---

# Workflow Docker

Le projet tourne sous Docker Compose. Le `docker-compose.yml` vit dans `docker/` à la racine du repo (`/home/marc/Bureau/projets/vesper/docker/docker-compose.yml`) et couvre l'ensemble du monorepo — services `back`, `front`, `postgres_db`, `adminer`, `smtp4dev`.

**Toute commande** (tests, lint, format, typecheck, migrations, lancement du serveur de dev) doit être exécutée via Docker Compose, jamais directement sur la machine hôte. Le **Makefile à la racine du repo** (`/home/marc/Bureau/projets/vesper/Makefile`) est le point d'entrée unique — ne jamais taper `docker compose exec ...` à la main, toujours passer par une cible `make`. Si une cible nécessaire n'existe pas encore, le signaler plutôt que de contourner avec une commande docker ad hoc.

## Commandes disponibles (`make <cible>`, depuis la racine du repo)

Cycle de vie des containers :
- `make install` — build les images, `uv sync` / `npm install` dans les containers, démarre la stack (à relancer après un changement de dépendances)
- `make up` / `make start` / `make stop` / `make down` / `make restart` / `make status`
- `make uninstall` (ajouter `VOLUMES=yes` pour supprimer aussi les volumes)

Shell dans un container :
- `make sh_back` — shell dans le container `back` (ajouter `SUDO=yes` pour un shell root)
- `make sh_front`, `make sh_db`

Logs :
- `make log_back`, `make log_front`, `make log_db`, `make log_adminer`, `make log_smtp4dev`

Qualité de code — back (voir `linting-formatting.md` pour le détail des tasks `uv`/`taskipy` sous-jacentes) :
- `make back_lint` → `uv run task lint` (ruff check)
- `make back_format` → `uv run task format` (black + ruff --fix)
- `make back_typecheck` → `uv run task typecheck` (pyright strict)
- `make back_test` → `uv run task test` (pytest -v)

Base de données :
- `make migrate` — applique les migrations Alembic (`alembic upgrade head`)
- `make migration NAME="description"` — génère une migration (`alembic revision --autogenerate -m "..."`)

Qualité de code — front : voir `quality-checks.md` et `docker.md` côté `src/front`.

## URLs exposées

- Back : http://localhost:9000
- Front : http://localhost:3000
- Adminer : http://localhost:8080
- Smtp4dev : http://localhost:5000

(Ports définis dans `docker/.env`, ne pas les coder en dur ailleurs.)
