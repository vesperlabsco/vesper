# Environnement Docker

## Emplacement

- `docker/` (docker-compose et fichiers associés) se trouve à la racine du repo, en `../../docker` depuis `src/front` — c'est-à-dire au même niveau que `src/`.
- Le **Makefile à la racine du repo** (`../../Makefile`) est le point d'entrée unique pour piloter Docker (up/down/build/logs/shell) et pour lancer les commandes npm du front dans le conteneur — ne jamais taper `docker compose exec ...` à la main.
- Service docker-compose du front : `front` (image `node:24-bookworm`, voir `docker/docker-compose.yml` et `docker/front/Dockerfile`).

## Règle

- Le front tourne dans un conteneur : le toolchain (lint, tests, build, dev server) vit côté conteneur, pas côté host. `node_modules`, lui, est un bind mount classique partagé avec le host (choix assumé — utile pour l'autocomplétion IDE), pas un volume nommé isolé.
- Toute commande npm (`dev`, `lint`, `test`, `build`, ...) s'exécute **dans le conteneur**, jamais directement sur le host.
- Préférer une cible `make` (`make front_lint`, `make front_lint_fix`, `make front_format`, `make front_test`, `make front_build`) à un `docker compose exec front npm run ...` tapé à la main — le Makefile est la source de vérité des commandes.
- Shell dans le container : `make sh_front` (ajouter `SUDO=yes` pour un shell root). Logs : `make log_front`.
- Si une cible Make nécessaire n'existe pas encore, le signaler plutôt que de contourner avec une commande docker ad hoc.

## Cibles Make disponibles aujourd'hui

| Cible                 | Commande réelle (`package.json`)         | Statut                                                                                             |
| --------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `make front_lint`     | `npm run lint` → `eslint .`              | fonctionnelle                                                                                      |
| `make front_lint_fix` | `npm run lint:fix` → `eslint . --fix`    | fonctionnelle (corrige l'auto-fixable, le reste se corrige à la main)                              |
| `make front_format`   | `npm run format` → `prettier --write .`  | fonctionnelle                                                                                      |
| `make front_test`     | `npm run test` → `vitest run`            | fonctionnelle (unitaire uniquement — Playwright/e2e pas encore installé, voir `quality-checks.md`) |
| `make front_build`    | `npm run build` → `tsc -b && vite build` | fonctionnelle                                                                                      |

Pas de cible `make front_dev` : le serveur de dev Vite démarre automatiquement au boot du container (`npm run dev -- --host 0.0.0.0 --port 5173`, piloté par supervisord — voir `docker/front/supervisor/ihm.conf`), accessible sur http://localhost:3000 (port hôte défini par `FRONT_PORT` dans `docker/.env`). `make up`/`make start` suffisent à le lancer.

Playwright en mode headed (une fois installé) sera visible via noVNC sur http://localhost:6080/vnc_auto.html — le display Xvfb + x11vnc + noVNC est déjà en place dans le container (`docker/front/Dockerfile`, `docker/front/supervisor/`), en attendant l'ajout de Playwright à `package.json`.
