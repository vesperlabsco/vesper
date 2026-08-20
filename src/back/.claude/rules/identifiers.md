# Identifiants (clés primaires)

## Règle : UUID uniquement là où l'identifiant peut être exposé

Le critère est l'**exposition**, pas le fait d'appartenir à un domaine métier. Une entité utilise un **UUID comme clé primaire** si son `id` est susceptible d'apparaître dans une URL front, une réponse d'API adressable individuellement (`GET /animals/{id}`), ou un lien partagé. C'est le cas des entités qu'on cible explicitement en premier lieu : `clinic`, `user`, `animal`, `medical_record`/dossier médical.

Ce n'est **pas** une règle par défaut pour toutes les tables. Une table interne à un domaine — table de liaison, table de référence/nomenclature (ex. `species`, `breed`, statuts), table de log/audit, ligne d'un sous-objet toujours accédée via son parent — n'a pas besoin d'UUID si elle n'est jamais adressée par son propre `id` dans une route. Un entier auto-incrémenté classique reste le choix par défaut pour ces cas-là : plus simple, plus léger en index, sans overhead de génération applicative. En cas de doute sur une table donnée, la question à trancher au cas par cas est : *« cet `id` sera-t-il un jour dans une URL du front ou une réponse JSON exposée au client ? »* — si oui, UUID ; sinon, entier.

**Pourquoi UUID quand c'est exposé** : un identifiant séquentiel (`/animals/42`) expose le volume de données (nombre de cliniques, d'utilisateurs, de dossiers médicaux) et permet l'énumération d'IDs voisins. Un UUID en tant que clé primaire élimine ce risque sans nécessiter de colonne d'identifiant publique séparée.

## Version : UUID v7

- Génération via **UUID v7** (RFC 9562, time-ordered) plutôt que v4 (aléatoire pur) : les octets de poids fort encodent un timestamp, ce qui garantit une meilleure localité d'insertion dans l'index B-tree Postgres de la clé primaire (moins de fragmentation qu'un v4 totalement aléatoire), sans rendre l'ID devinable de façon exploitable (la partie aléatoire reste suffisante).
- **Compromis accepté explicitement** : un UUID v7 encode un timestamp de génération approximatif (résolution milliseconde). Cela révèle l'ordre chronologique de création d'une ressource à qui possède l'ID — jugé acceptable ici, y compris pour les dossiers médicaux, car cette information n'est pas plus sensible que la donnée elle-même une fois l'ID connu (accès déjà authentifié/autorisé pour tout ce qui est sous `private/`).
- Génération côté application (pas via `gen_random_uuid()` côté Postgres, qui produit du v4) :
  - Si `uuid.uuid7` est disponible dans la stdlib (Python ≥ 3.14) : l'utiliser directement.
  - Sinon, dépendance dédiée (ex. `uuid6` ou `uuid-utils`) — à figer dans `pyproject.toml` une fois le projet initialisé.

## Implémentation SQLAlchemy

```python
import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

class Animal(Base):
    __tablename__ = "animals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid7
    )
```

- Colonne `id` typée `UUID(as_uuid=True)` (type Python `uuid.UUID`, pas `str`).
- Les clés étrangères entre domaines référencent également ces UUID (jamais un entier).
- Les schémas Pydantic (`schemas.py`) exposent ce champ typé `uuid.UUID` — la sérialisation JSON standard le transforme en chaîne, aucune conversion manuelle nécessaire.

## Coexistence des deux stratégies

Rien n'empêche un domaine de mélanger les deux : ex. `medical_record` en UUID (exposé au front), mais une table `medical_record_change_log` interne en entier auto-incrémenté (jamais consultée par son propre ID). Les clés étrangères suivent le type de la table référencée — une FK vers une table en UUID est en UUID, une FK vers une table en entier reste en entier. Pas besoin de justification particulière pour choisir l'entier par défaut ; c'est le cas UUID qui, lui, doit correspondre à un vrai besoin d'exposition.
