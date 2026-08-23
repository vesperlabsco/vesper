---
name: testing
description: Conventions de nommage pytest (fake_/mock_/_mock/stub_/_fixture), interdiction des abréviations, structure des tests
---

# Conventions de tests (pytest)

## Emplacement

`__tests__/` reproduit exactement l'arborescence de `app/` (`pyproject.toml` → `[tool.pytest.ini_options].testpaths = ["__tests__"]`). Un module `app/domains/users/services.py` a son test dans `__tests__/app/domains/users/test_services.py`.

> Le schéma d'arborescence de `architecture.md` n'a pas encore été repassé en revue après le passage de `src/app/` à `app/` — se fier à `pyproject.toml` et à l'arborescence réelle de `app/`/`__tests__/`, pas au diagramme.

Lancer la suite via `make back_test` (voir `docker-workflow.md`), jamais `pytest` directement sur l'host.

## Nommage — distinguer données de test et objets mockés

### Objets « fake » (vraies données de test)
Préfixe `fake_`.

```python
fake_user = User(id=1, name="Alice")
```

### Objets mockés
Préfixe `mock_`.

```python
mock_user_repository = mocker.Mock()
```

### Fonctions patchées
Les variables recevant le résultat de `mocker.patch()` se terminent par `_mock`.

```python
logger_mock = mocker.patch("app.core.logging.logger")
```

### Implémentations stub
Préfixe `stub_` pour les implémentations minimales retournant des valeurs fixes.

```python
stub_user_repository = StubUserRepository()
```

### Fixtures
Les fixtures se terminent par `_fixture`.

```python
def test_create_user(user_fixture):
    ...
```

## Pas d'abréviations dans le code de test

Règle générale du projet, voir `naming-typing.md`. Dans les fonctions de test et leurs helpers, ne pas utiliser de noms abrégés ou cryptiques. Préférer des mots complets et explicites pour que l'intention reste évidente dans les assertions et le setup des mocks.

- **Interdit** : noms d'une lettre (`x`, `m`, `i` — sauf boucle d'index pure si l'équipe l'autorise explicitement), tokens raccourcis (`svc`, `cfg`, `mgr`, `sc_args`, `m1`, `m_a`), préfixes opaques.
- **Préférer** : `hardware_statuses`, `first_tablet_hardware_metric`, `status_method_positional_args`, `second_schema`, etc.

Les noms imposés par le framework restent autorisés (`self`, `mocker`, fixtures fournies par `conftest.py` comme `mock_db`).

## Récapitulatif

| Type | Convention |
|------|-------|
| Données fake | `fake_` |
| Objet mocké | `mock_` |
| Stub | `stub_` |
| Fonction patchée | `_mock` |
| Fixture | `_fixture` |
| Noms locaux dans les tests | Mots complets, pas d'abréviation |
