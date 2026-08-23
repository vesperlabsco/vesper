---
name: linting-formatting
description: Ruff (lint) + Black (format) + Pyright strict (typecheck), pilotés par les tasks taskipy de pyproject.toml, exécutés via make back_lint / back_format / back_typecheck
---

# Linting & formatage

## Outils et tasks

Les commandes de qualité de code sont définies **une seule fois**, comme tasks `taskipy` dans `pyproject.toml` (`[tool.taskipy.tasks]`). Le Makefile racine (voir `docker-workflow.md`) se contente d'appeler `uv run task <nom>` dans le container `back` — il ne réinvoque jamais un outil (`ruff`, `black`, `pyright`, `pytest`) directement. `pyproject.toml` est donc la source de vérité : si une commande doit changer, elle se change là, pas dans le Makefile.

| Task (`uv run task <nom>`) | Commande réelle | Cible `make` |
|---|---|---|
| `lint` | `ruff check .` | `make back_lint` |
| `format` | `black . && ruff check . --fix` | `make back_format` |
| `typecheck` | `pyright .` | `make back_typecheck` |
| `test` | `pytest -v` | `make back_test` |
| `test_log` | `pytest -v -s` | — (manuel : `uv run task test_log`) |
| `test_cov` | `pytest -q --cov=app --cov-report=term-missing --cov-report=html` | — (manuel : `uv run task test_cov`) |

**Ruff = linter uniquement** (`ruff check`, avec l'extension `I` activée pour le tri des imports — voir `[tool.ruff.lint]` dans `pyproject.toml`). Le **formatage est délégué à Black**, pas à `ruff format` — ne pas les mélanger, ne pas lancer `ruff format` à la main.

`make back_lint` doit être lancé systématiquement avant de considérer du code back comme terminé.

## Vérification de types stricte

**Pyright** (mode strict) est le vérificateur de types du projet — pas mypy. Exécuté via `make back_typecheck` sur l'intégralité de `app/`, en complément du ban sur `Any` (voir `naming-typing.md`).

## Pré-commit

Pas de hooks pre-commit pour l'instant (décision explicite : on reste sur les tasks `uv`/`taskipy`, exécutées manuellement via `make` ou en CI). À réévaluer plus tard si le besoin s'en fait sentir.

## CI

La CI doit rejouer les mêmes cibles que le Makefile local (`back_lint`, `back_typecheck`, `back_test`) — pas de logique dupliquée entre local et CI.
