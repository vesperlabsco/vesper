---
name: architecture
description: Arborescence du projet, responsabilité de chaque dossier, organisation domain-first
---

# Architecture

## Principe : organisation par domaine, pas par couche

Le code métier est regroupé par **domaine fonctionnel** (`domains/<domaine>/`), pas dans des dossiers globaux `schemas/`, `services/`, `models/` partagés entre tous les domaines. Chaque domaine est une tranche verticale autonome : `schemas.py`, `models.py`, `repositories.py`, `services.py`, et `keys.py` s'il a des clés i18n (succès/erreur) qui lui sont propres (pas de `exceptions.py` par domaine — voir *Design des exceptions* plus bas).

Avantage : ajouter un domaine (ex. `animals`) n'implique pas de toucher aux dossiers des autres domaines, et les tests (`__tests__/app/domains/<domaine>/`) restent alignés 1:1 avec le code source.

> **État actuel** : `domains/` est encore vide (squelette `__init__.py` seulement) — aucun domaine métier n'est implémenté à ce jour. Les conventions ci-dessous (get_/find_, UUID v7, etc.) s'appliquent dès le premier domaine ajouté.

## Arborescence

```
src/back/
├── pyproject.toml            # dépendances gérées par uv, tasks taskipy (lint/format/typecheck/test), config ruff, config pytest
├── uv.lock
├── alembic.ini                # script_location = app/migrations
├── .env.dist
├── CLAUDE.md
├── .claude/rules/
├── app/
│   ├── main.py                 # instanciation FastAPI(), lifespan, middlewares (CORS, secure headers), montage du router v1
│   ├── config/
│   │   └── settings.py         # pydantic-settings — Settings + instance globale `settings`
│   ├── core/
│   │   ├── logger.py           # logger applicatif
│   │   ├── constants.py
│   │   ├── messages.py         # ErrorKey/SuccessKey (StrEnum) — clés i18n transverses, voir naming-typing.md
│   │   ├── exception_handlers.py  # register_exception_handlers(app) — mapping AppException/AppHTTPException/HTTPException → JSON standardisé
│   │   └── security/
│   │       ├── core.py             # SecurityCore — hash/verify de token
│   │       ├── constants.py
│   │       ├── rate_limiter.py     # dépendance FastAPI (Depends(rate_limit)), pyrate-limiter
│   │       └── secure_headers.py   # middleware ASGI headers sécurité (secure), exempté sur Swagger/ReDoc
│   ├── database.py             # engine sync/async, session_maker, Base (DeclarativeBase), init_db(), get_session()/get_sync_session()
│   ├── api/v1/
│   │   ├── public/
│   │   │   └── health/          # squelette en place — pas encore de routes.py câblé (le `/health` actuel est défini inline dans main.py)
│   │   └── private/              # squelette en place — router non câblé (commenté dans main.py)
│   ├── domains/                  # vide pour l'instant, voir note ci-dessus
│   ├── dependencies/             # vide pour l'instant — pas encore de Depends() (auth, pagination...) à factoriser ici
│   ├── exceptions/
│   │   └── base.py               # AppException (message + key i18n + status_code) et AppHTTPException — voir note ci-dessous
│   └── migrations/                # Alembic, piloté par alembic.ini
│       ├── env.py
│       ├── script.py.mako
│       └── versions/
└── __tests__/                    # miroir exact de app/ — voir testing.md
```

**Écarts assumés par rapport à un découpage `core/`/`db/`/`exceptions/` plus fin** :
- Pas de `db/session.py` + `db/base.py` séparés : `engine_sync`/`engine_async`, `session_maker` et `Base` (declarative base) vivent tous dans **`app/database.py`**, un seul fichier à la racine de `app/`.
- Pas de `core/config.py` : les settings sont dans **`config/settings.py`**, un package dédié au même niveau que `core/`, pas dedans.
- Pas de `exceptions/handlers.py` : les handlers d'exception vivent dans **`core/exception_handlers.py`**.
- `core/security.py` est un **package** (`core/security/`), pas un fichier unique — la surface (hash de token, rate limiting, headers sécurité) est déjà assez large pour justifier la scission.

**Design des exceptions** — `app/exceptions/base.py` ne suit pas le pattern "une sous-classe par erreur métier" : c'est volontairement **une paire générique** —

```python
class AppException(Exception):
    def __init__(self, message=None, key=None, status_code=400): ...

class AppHTTPException(AppException):
    def __init__(self, message, status_code=400, key=None): ...
```

Une erreur métier s'exprime en instanciant directement `AppHTTPException(message=..., status_code=..., key=...)` au point où elle est levée (ex. `app/core/security/rate_limiter.py`), pas via une classe dédiée par cas d'erreur (`UserNotFoundException` et consorts). `app/core/exception_handlers.py` mappe ces deux classes (+ `HTTPException` en filet de sécurité) vers le format JSON standard (`{success, message, key}`). Sauf besoin explicite plus tard, aucune autre classe d'exception ne devrait être créée dans le projet.

La `key` elle-même n'est jamais une chaîne littérale tapée au point de levée : c'est un membre de `StrEnum`, défini soit dans `app/core/messages.py` (`ErrorKey`/`SuccessKey`, transverse à plusieurs domaines ou infra — ex. `ErrorKey.TOO_MANY_REQUESTS` dans `rate_limiter.py`), soit dans `domains/<domaine>/keys.py` pour une clé propre à un seul domaine. Détail complet dans `naming-typing.md`.

## Responsabilité de chaque couche

- **`api/v1/{public,private}`** — couche HTTP fine uniquement : routing, codes de statut, validation des entrées/sorties via les `schemas`. Ne contient **aucune logique métier** ; appelle toujours un `service`.
- **`public/`** — endpoints sans authentification (ex. `/health`, `/ready`, login).
- **`private/`** — endpoints nécessitant l'authentification, protégés par une dépendance `Depends(get_current_user)` (voir `dependencies/auth.py`).
- **`domains/*/services.py`** — logique métier, orchestration entre repositories, validations métier.
- **`domains/*/repositories.py`** — **seule couche autorisée à effectuer des I/O externes** : requêtes à la base de données **et** appels à des API/services externes (HTTP, API tierces, autres microservices). Un `service` ne fait **jamais** de requête DB ni d'appel HTTP directement — il délègue systématiquement au `repository` de son propre domaine. C'est ici que s'appliquent les conventions `get_`/`find_` (voir `naming-typing.md`). Si la surface d'appels externes grossit, scinder en plusieurs fichiers (ex. `repositories/db_repository.py`, `repositories/external_api_repository.py`) plutôt que d'enfreindre la règle.
- **`domains/*/models.py`** — modèles ORM SQLAlchemy, jamais exposés directement en réponse HTTP. Clé primaire en UUID v7, voir `identifiers.md`.
- **`domains/*/schemas.py`** — contrats I/O Pydantic, volontairement séparés des modèles ORM.
- **`domains/*/exceptions.py`** — n'existe pas dans le sens "classes dédiées par domaine" : voir la note *Design des exceptions* ci-dessus. Un `get_` qui échoue lève directement `AppHTTPException(message=..., status_code=..., key=...)`, pas une exception spécifique au domaine.
- **`dependencies/`** — tout ce qui est injecté via `Depends()` : session DB, utilisateur courant, pagination. Rien n'est instancié "à la main" dans une route.
- **`core/exception_handlers.py`** — mappe `AppException`/`AppHTTPException`/`HTTPException` vers des réponses HTTP cohérentes ; les services ne lèvent jamais `HTTPException` directement.

## Règles de dépendances entre domaines

- Un `service` d'un domaine peut appeler le `service` d'un **autre** domaine (ex. `domains/orders/services.py` appelle `domains/users/services.py`), mais **jamais** directement son `repository` ni ses `models` — ce sont des détails d'implémentation privés du domaine, non exposés aux autres domaines.
- Le seul point d'entrée autorisé entre deux domaines est donc `service → service`. Toute autre combinaison est interdite : `service → repository` d'un autre domaine, `repository → repository` d'un autre domaine, `service`/`repository` → `models` d'un autre domaine.
- Un `repository` ne dépend jamais d'un autre domaine, ni même du `service` de son propre domaine (pas de dépendance remontante) — il reste la couche la plus basse de son domaine, appelée uniquement par le `service` du même domaine.
- Éviter les dépendances circulaires entre domaines : si `orders` appelle `users`, `users` ne doit pas appeler `orders` en retour. En cas de besoin mutuel réel, extraire la logique partagée dans `app/core/` (ou un nouveau domaine dédié) plutôt que de créer un cycle.

Schéma des imports autorisés :

```
api/v1/*  ──►  domains/<domaine>/services.py  ──►  domains/<domaine>/repositories.py  ──►  DB / API externes
                        │
                        └──►  domains/<autre-domaine>/services.py   (jamais repositories.py ni models.py de l'autre domaine)
```

## API — versionnement

L'API est versionnée par chemin d'URL (`/api/v1/...`). Toute rupture de compatibilité majeure donnera lieu à un futur `/v2`, sans supprimer `/v1` tant qu'une politique de dépréciation n'a pas été appliquée.
