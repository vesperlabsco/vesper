---
name: architecture
description: Arborescence du projet, responsabilité de chaque dossier, organisation domain-first
---

# Architecture

## Principe : organisation par domaine, pas par couche

Le code métier est regroupé par **domaine fonctionnel** (`domains/<domaine>/`), pas dans des dossiers globaux `schemas/`, `services/`, `models/` partagés entre tous les domaines. Chaque domaine est une tranche verticale autonome : `schemas.py`, `models.py`, `repositories.py`, `services.py`, `exceptions.py`.

Avantage : ajouter un domaine (ex. `animals`) n'implique pas de toucher aux dossiers des autres domaines, et les tests (`tests/app/domains/<domaine>/`) restent alignés 1:1 avec le code source.

## Arborescence

```
src/back/
├── pyproject.toml            # dépendances gérées par uv, config ruff, config pytest
├── uv.lock
├── .env.example
├── Dockerfile
├── CLAUDE.md
├── .claude/rules/
├── src/app/
│   ├── main.py                # instanciation FastAPI(), lifespan, montage des routers
│   ├── core/
│   │   ├── config.py          # pydantic-settings, layering d'environnement (dev/test/prod)
│   │   ├── logging.py         # logging structuré JSON + request-id
│   │   └── security.py        # helpers auth/jwt partagés
│   ├── api/v1/
│   │   ├── router.py          # agrège public + private
│   │   ├── public/
│   │   │   ├── router.py
│   │   │   └── health/routes.py      # /health, /ready — non authentifiés
│   │   └── private/
│   │       └── router.py             # domaines nécessitant l'authentification
│   ├── domains/
│   │   └── <domaine>/         # ex: users, animals
│   │       ├── schemas.py     # DTOs Pydantic v2 (request/response)
│   │       ├── models.py      # modèles SQLAlchemy 2.0 async
│   │       ├── repositories.py  # accès DB — voir naming-typing.md pour get_/find_
│   │       ├── services.py    # logique métier
│   │       └── exceptions.py  # exceptions spécifiques au domaine
│   ├── dependencies/
│   │   ├── auth.py            # Depends() : utilisateur courant, scopes
│   │   ├── database.py        # provider de session async
│   │   └── pagination.py
│   ├── exceptions/
│   │   ├── base.py            # AppException, classe de base
│   │   └── handlers.py        # exception_handlers FastAPI, mapping vers HTTP
│   └── db/
│       ├── session.py         # engine/session factory async
│       └── base.py            # declarative base, metadata
├── alembic/                   # migrations de schéma
└── tests/
    ├── conftest.py
    └── app/                    # miroir exact de src/app/ — voir testing.md
```

## Responsabilité de chaque couche

- **`api/v1/{public,private}`** — couche HTTP fine uniquement : routing, codes de statut, validation des entrées/sorties via les `schemas`. Ne contient **aucune logique métier** ; appelle toujours un `service`.
- **`public/`** — endpoints sans authentification (ex. `/health`, `/ready`, login).
- **`private/`** — endpoints nécessitant l'authentification, protégés par une dépendance `Depends(get_current_user)` (voir `dependencies/auth.py`).
- **`domains/*/services.py`** — logique métier, orchestration entre repositories, validations métier.
- **`domains/*/repositories.py`** — **seule couche autorisée à effectuer des I/O externes** : requêtes à la base de données **et** appels à des API/services externes (HTTP, API tierces, autres microservices). Un `service` ne fait **jamais** de requête DB ni d'appel HTTP directement — il délègue systématiquement au `repository` de son propre domaine. C'est ici que s'appliquent les conventions `get_`/`find_` (voir `naming-typing.md`). Si la surface d'appels externes grossit, scinder en plusieurs fichiers (ex. `repositories/db_repository.py`, `repositories/external_api_repository.py`) plutôt que d'enfreindre la règle.
- **`domains/*/models.py`** — modèles ORM SQLAlchemy, jamais exposés directement en réponse HTTP. Clé primaire en UUID v7, voir `identifiers.md`.
- **`domains/*/schemas.py`** — contrats I/O Pydantic, volontairement séparés des modèles ORM.
- **`domains/*/exceptions.py`** — exceptions métier du domaine, levées par les fonctions `get_`.
- **`dependencies/`** — tout ce qui est injecté via `Depends()` : session DB, utilisateur courant, pagination. Rien n'est instancié "à la main" dans une route.
- **`exceptions/handlers.py`** — mappe les exceptions métier vers des réponses HTTP cohérentes ; les services ne lèvent jamais `HTTPException` directement.

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
