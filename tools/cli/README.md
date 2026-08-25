# vesper CLI

Petit CLI qui relie une tâche Notion, une branche git et une Pull Request GitHub.

## Prérequis

- `gh` (GitHub CLI) installé et authentifié : `gh auth login`
- `jq` et `curl` (déjà présents sur cette machine)
- Une intégration interne Notion (créée sur https://www.notion.so/my-integrations), **partagée sur la page "Tâches"**.

## Installation

```bash
cp tools/cli/.env.dist tools/cli/.env
# éditer tools/cli/.env : NOTION_TOKEN, NOTION_DATABASE_ID, BASE_BRANCH
```

Optionnel, pour appeler `vesper` depuis n'importe où :

```bash
ln -s "$(pwd)/tools/cli/vesper" /usr/local/bin/vesper
```

## Commandes

### Lister les tâches

```bash
tools/cli/vesper task list
tools/cli/vesper task list --status Todo
```

### Démarrer une tâche

```bash
tools/cli/vesper task start 5
```

- Récupère la tâche `#5` dans Notion.
- Crée la branche depuis `origin/$BASE_BRANCH` en reprenant le nom généré par la propriété Notion `Branche` (ex: `5-test`).
- Pousse la branche sur GitHub.
- Passe le statut Notion de la tâche à **En cours**.

### Ouvrir la PR de fin de tâche

```bash
# depuis la branche de la tâche (l'ID est déduit du nom de branche)
tools/cli/vesper task pr

# ou explicitement, avec une description de l'action faite
tools/cli/vesper task pr 5 --desc "ajout du endpoint /health"
```

- Pousse la branche courante.
- Crée la PR sur GitHub avec pour titre `VSP-<id> - <Nom de la tâche> (<Type>): <description>` et un corps généré (lien Notion + liste des commits).
- Passe le statut Notion de la tâche à **Pull Request**.
- Ajoute un commentaire sur la tâche Notion avec le lien de la PR.

## Schéma Notion attendu

Base "Tâches" (colonnes utilisées par le CLI) :

| Propriété | Type      | Valeurs / rôle                                                        |
|-----------|-----------|------------------------------------------------------------------------|
| ID        | unique_id | identifiant numérique de la tâche                                     |
| Nom       | title     | titre de la tâche                                                      |
| Type      | select    | `Orga`, `Dev`                                                          |
| État      | status    | `Todo`, `En cours`, `Pull Request`, `Merged`, `Terminé`, `Archivé`     |
| Branche   | formula   | `git checkout -b <id>-<slug-du-nom>` — le CLI en extrait le nom de branche |
