# Environnement Docker

> ⚠️ Provisoire — l'environnement Docker/Makefile n'existe pas encore. Ce fichier pose l'intention ; il faudra le repasser en revue (noms de service exacts, noms de cibles Make, nom du binaire node/npm dans le conteneur) une fois `docker/` et le `Makefile` réellement écrits.

## Emplacement

- `docker/` (docker-compose et fichiers associés) se trouve à la racine du repo, en `../../docker` depuis `src/front` — c'est-à-dire au même niveau que `src/`.
- Un `Makefile` à la racine du repo (`../../`) sert de point d'entrée unique pour piloter Docker (up/down/build/logs/shell) et pour lancer les commandes npm du front dans le conteneur.

## Règle

- Le front tourne dans un conteneur : node_modules et le toolchain (lint, tests, build, dev server) vivent côté conteneur, pas côté host.
- Toute commande npm (`dev`, `lint`, `test`, `build`, ...) s'exécute **dans le conteneur**, jamais directement sur le host.
- Préférer une cible `make` (ex. `make lint`, `make test`) à un `docker compose exec <service> npm run ...` tapé à la main — le Makefile est la source de vérité des commandes, ça évite que chaque appel invente son propre nom de service/conteneur.
- Si une cible Make nécessaire n'existe pas encore, le signaler plutôt que de contourner avec une commande docker ad hoc.

## À faire une fois l'environnement en place

- Renseigner ici le nom du service docker-compose pour le front, et la liste des cibles Make disponibles (lint, test unitaire, test e2e, build, dev).
