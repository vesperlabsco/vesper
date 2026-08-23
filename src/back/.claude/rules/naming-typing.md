---
name: naming-typing
description: Conventions get_/find_, exceptions métier, typage strict, interdiction de Any, regroupement en @staticmethod
---

# Nommage des accès aux données & typage

## Fonctions `get...` vs `find...`

- **`get...`** : la fonction **doit impérativement** retourner une valeur. Si aucun résultat n'est trouvé, elle **lève** `AppHTTPException` (voir *Exceptions métier* ci-dessous) — jamais `None`, jamais une valeur par défaut silencieuse.
  Exemple : `getUserById(user_id: int) -> User` — si l'utilisateur n'existe pas, `raise AppHTTPException(message=f"User {user_id} not found", status_code=404, key=UserErrorKey.NOT_FOUND)`.
- **`find...`** : la fonction **peut** retourner `None` (ou une liste vide) si rien n'est trouvé. C'est le cas d'usage normal, pas une erreur.
  Exemple : `findAnimal(animal_id: int) -> Animal | None`.

> **Exception de casse assumée** : ces fonctions sont nommées en **camelCase** (`getUserById`, `findAnimal`), par choix explicite, alors que le reste du code Python de ce projet suit PEP8/snake_case. Cette dérogation est volontaire et ne doit pas être « corrigée » vers `get_user_by_id`. Elle s'applique uniquement aux fonctions d'accès aux données préfixées `get`/`find` (typiquement dans `repositories.py`).

## Exceptions métier

**Pas de classe dédiée par cas d'erreur.** `app/exceptions/base.py` expose une paire générique — `AppException` et sa sous-classe `AppHTTPException` — pas une hiérarchie à faire grossir (une `UserNotFoundException`, une `AnimalNotFoundException`, etc.) au fil des domaines. Choix assumé : avec autant de domaines et de fonctions `get_`/`find_` que le projet va accumuler, une classe par erreur métier finirait par proliférer pour un bénéfice faible — le `status_code` et la `key` suffisent à distinguer les cas côté client.

```python
class AppException(Exception):
    def __init__(self, message=None, key=None, status_code=400): ...

class AppHTTPException(AppException):
    def __init__(self, message, status_code=400, key=None): ...
```

Une erreur métier (ex. un `get_` qui ne trouve rien) se lève en instanciant `AppHTTPException` directement au point d'échec, avec un `status_code` HTTP et une `key` de traduction spécifiques au cas :

```python
raise AppHTTPException(
    message=f"User {user_id} not found",
    status_code=404,
    key=UserErrorKey.NOT_FOUND,
)
```

La `key` est ce qui identifie le cas d'erreur côté front (i18n, gestion fine par le client) — pas besoin d'une classe Python dédiée pour ça. `app/core/exception_handlers.py` mappe `AppException`/`AppHTTPException`/`HTTPException` vers le format JSON standard (`{success, message, key}`) — jamais de `HTTPException` levée directement depuis un `service` ou un `repository`.

### Format d'une `key`

`api.<scope>.<success|error>.<cas-en-kebab-case>` — ex. `api.auth.success.login`, `api.users.error.not-found`, `api.common.error.too-many-requests`. `<scope>` est le nom du domaine (`users`, `auth`, `animals`...) ou `common` pour une clé transverse non liée à un domaine précis (même logique que `common.json` côté front, voir `i18n.md` front). Le `<cas>`, dès qu'il a plus d'un mot, est en **kebab-case** (`too-many-requests`, pas `too_many_requests`) — cohérence avec le front.

### Où vivent les `key` (succès et erreur)

Les `key` ne sont **jamais des chaînes littérales tapées à la volée** au point de levée (`key="api.users.error.not-found"`) — elles sont des membres d'un `StrEnum`, pour avoir l'autocomplétion, éviter les typos silencieuses, et savoir où chercher/ajouter une clé :

- **Transverses / infra** (`<scope>` = `common`, ou pas liées à un domaine — rate limiting, auth, validation générique) : `app/core/messages.py` (`ErrorKey`, et `SuccessKey` le jour où un premier cas de succès en a besoin). Ex. `ErrorKey.TOO_MANY_REQUESTS = "api.common.error.too-many-requests"`.
- **Propres à un domaine** (`<scope>` = nom du domaine) : `domains/<domaine>/keys.py` (ex. `UserErrorKey.NOT_FOUND = "api.users.error.not-found"`), colocées avec le `service`/`repository` qui les lève — pas remontées dans `core/` seulement parce qu'elles sont utilisées côté front (toutes les `key` le sont).

Ce découpage suit le même principe domain-first que le reste du projet (voir `architecture.md`) plutôt qu'un fichier unique qui grossirait indéfiniment et deviendrait un point de contention entre domaines.

## Typage

- Tout le code est typé : paramètres, valeurs de retour, attributs de classe.
- `Any` est **interdit**, sauf justification explicite écrite en commentaire à côté de son usage (ex. interop avec une librairie non typée).
- **Pyright** (mode strict) tourne en complément de Ruff, en local (`make back_typecheck`) et en CI — voir `linting-formatting.md`.

## Pas d'abréviations ni de diminutifs

Cette règle s'applique à **tout le projet** (pas seulement aux tests, voir aussi `testing.md`) : noms de variables, de fonctions, de classes, de modules/fichiers, de paramètres, d'attributs. Utiliser des mots complets et explicites plutôt que des raccourcis.

- **Interdit** : abréviations (`svc`, `cfg`, `mgr`, `repo`, `usr`, `req`, `resp`, `ctx`, `attr`), diminutifs (`param` pour `parameter`, `env` pour `environment`, `id` seul quand `user_id`/`animal_id` est plus explicite), noms d'une lettre (`x`, `m`, `i` — sauf boucle d'index pure explicitement autorisée par l'équipe), noms de fichiers tronqués (`usr_repo.py` au lieu de `user_repository.py`).
- **Préférer** : le mot complet même s'il est plus long — `service`, `config`, `manager`, `repository`, `user`, `request`, `response`, `context`, `attribute`.
- Les noms imposés par un framework/une librairie restent autorisés tels quels (`self`, `cls`, `mocker`, `db`, `id` en tant que nom de colonne SQLAlchemy standard).
- Un nom de fichier ou de dossier reflète toujours le mot complet du concept qu'il représente (`repositories.py`, pas `repos.py` ; `dependencies/`, pas `deps/`).

## Fonctions simples et isolées

Une fonction simple, sans état d'instance ni dépendance à `self`, est regroupée dans une classe dédiée et annotée `@staticmethod`, plutôt que laissée en fonction libre au niveau du module.

```python
class DateFormatter:
    @staticmethod
    def to_iso(value: datetime) -> str:
        return value.isoformat()
```
