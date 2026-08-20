---
name: docker-workflow
description: Toutes les commandes (tests, lint, run) passent par Docker Compose — note à mettre à jour une fois les containers en place
---

# Workflow Docker

Le projet tourne sous Docker. Le `docker-compose.yml` vit dans `../docker/` par rapport à ce dossier (`/home/marc/Bureau/projets/vesper/docker/docker-compose.yml`), et couvre l'ensemble du monorepo (`back/`, `front/`).

**Toute commande** (tests, lint, migrations, lancement du serveur de dev) doit être exécutée via Docker Compose, jamais directement sur la machine hôte, afin de garantir un environnement reproductible.

> **[À METTRE À JOUR]** Les containers ne sont pas encore en place (`../docker/` est vide à ce jour). Une fois `docker-compose.yml` créé, remplacer les commandes ci-dessous par les commandes réelles, par exemple :
> ```
> docker compose -f ../docker/docker-compose.yml exec back uv run pytest
> docker compose -f ../docker/docker-compose.yml exec back uv run ruff check .
> docker compose -f ../docker/docker-compose.yml up back
> ```

## En attendant

Tant que les containers ne sont pas configurés, documenter dans ce fichier toute commande temporaire utilisée en local, avec la mention explicite qu'elle est provisoire et sera remplacée par son équivalent Docker.
