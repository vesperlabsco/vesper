"""Clés de traduction (i18n) transverses, utilisées par plusieurs domaines ou au niveau infra.

Consommées côté front pour traduire `key` dans le corps JSON standard
(`{success, message, key}` — voir `app/core/exception_handlers.py`). Une clé
propre à un seul domaine se définit dans `domains/<domaine>/keys.py`, pas ici.
"""

from enum import StrEnum


class ErrorKey(StrEnum):
    TOO_MANY_REQUESTS = "api.common.error.too-many-requests"
