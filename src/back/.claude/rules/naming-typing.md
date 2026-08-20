---
name: naming-typing
description: Conventions get_/find_, exceptions métier, typage strict, interdiction de Any, regroupement en @staticmethod
---

# Nommage des accès aux données & typage

## Fonctions `get...` vs `find...`

- **`get...`** : la fonction **doit impérativement** retourner une valeur. Si aucun résultat n'est trouvé, elle **lève** une exception métier dédiée — jamais `None`, jamais une valeur par défaut silencieuse.
  Exemple : `getUserById(user_id: int) -> User` — si l'utilisateur n'existe pas, `raise UserNotFoundException(user_id)`.
- **`find...`** : la fonction **peut** retourner `None` (ou une liste vide) si rien n'est trouvé. C'est le cas d'usage normal, pas une erreur.
  Exemple : `findAnimal(animal_id: int) -> Animal | None`.

> **Exception de casse assumée** : ces fonctions sont nommées en **camelCase** (`getUserById`, `findAnimal`), par choix explicite, alors que le reste du code Python de ce projet suit PEP8/snake_case. Cette dérogation est volontaire et ne doit pas être « corrigée » vers `get_user_by_id`. Elle s'applique uniquement aux fonctions d'accès aux données préfixées `get`/`find` (typiquement dans `repositories.py`).

## Exceptions métier

Chaque domaine définit ses propres exceptions dans `domains/<domaine>/exceptions.py`, héritant toutes d'une base commune `AppException` (`app/exceptions/base.py`) qui hérite elle-même d'`Exception`.

```python
class AppException(Exception):
    pass

class UserNotFoundException(AppException):
    def __init__(self, user_id: int) -> None:
        super().__init__(f"User {user_id} not found")
        self.user_id = user_id
```

Ces exceptions sont mappées vers des réponses HTTP dans `app/exceptions/handlers.py` — jamais levées comme `HTTPException` directement depuis un `service` ou un `repository`.

## Typage

- Tout le code est typé : paramètres, valeurs de retour, attributs de classe.
- `Any` est **interdit**, sauf justification explicite écrite en commentaire à côté de son usage (ex. interop avec une librairie non typée).
- Un vérificateur de types strict (mypy strict, ou pyright en mode strict — à trancher techniquement) tourne en complément de Ruff, en local (task `uv`) et en CI.

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
