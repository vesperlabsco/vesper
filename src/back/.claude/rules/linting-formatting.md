---
name: linting-formatting
description: Ruff (lint + format) via task uv, typage strict, pas de pre-commit pour l'instant
---

# Linting & formatage

## Ruff

Ruff est l'unique linter/formatter du projet (`ruff check` + `ruff format`). Il doit être lancé systématiquement, via une task `uv` dédiée (ex. `uv run lint`), avant de considérer du code comme terminé.

> **[À METTRE À JOUR]** La task `uv` n'existe pas encore. Une fois créée dans `pyproject.toml` (section `[tool.uv]` / scripts), remplacer cette note par la commande exacte à exécuter, par ex. :
> ```
> uv run ruff check .
> uv run ruff format .
> ```
> Voir aussi `docker-workflow.md` : une fois les containers en place, cette commande devra être lancée via `docker compose exec`.

## Vérification de types stricte

En complément du ban sur `Any` (voir `naming-typing.md`), un vérificateur de types strict (mypy strict ou pyright strict) est exécuté en local et en CI, sur l'intégralité de `src/app`.

## Pré-commit

Pas de hooks pre-commit pour l'instant (décision explicite : on reste sur la task `uv` exécutée manuellement/en CI). À réévaluer plus tard si le besoin s'en fait sentir.

## CI

La CI doit rejouer les mêmes commandes que la task `uv` locale (ruff check, ruff format --check, vérification de types stricte) — pas de logique dupliquée entre local et CI.
