# Setup du CLI vesper

Guide pas-à-pas pour installer et configurer tout ce dont le CLI `vesper` a besoin :
`gh` (GitHub CLI) authentifié, et un token Notion valide dans `tools/cli/.env`.

## 1. Installer `gh`

**Ubuntu / Debian**

```bash
sudo apt install gh
```

**macOS**

```bash
brew install gh
```

**Autre OS / vérifier la dernière version** : https://github.com/cli/cli#installation

Vérifier l'installation :

```bash
gh --version
```

## 2. Authentifier `gh`

```bash
gh auth login
```

Répondre aux questions :

- **What account do you want to log into?** → `GitHub.com`
- **What is your preferred protocol for Git operations?** → `SSH` (le remote `origin` du repo est en SSH ; choisir `HTTPS` marche aussi mais il faudra alors reconfigurer le remote)
- **Upload your SSH public key to your GitHub account?** → `Yes` si tu n'as pas déjà ta clé sur GitHub, sinon `Skip`
- **How would you like to authenticate GitHub CLI?** → `Login with a web browser`

Un code à 8 caractères s'affiche, avec une URL (`https://github.com/login/device`) : ouvrir l'URL, coller le code, valider dans le navigateur.

Vérifier que c'est bon :

```bash
gh auth status
```

Doit afficher `✓ Logged in to github.com account <ton-compte>` avec le scope `repo`.

## 3. Créer le token Notion

1. Aller sur https://www.notion.so/my-integrations
2. **+ New integration**
   - Nom : `vesper-cli` (ou ce que tu veux)
   - Espace de travail associé : celui qui contient la page "Tâches"
   - Type : **Internal integration**
3. Une fois créée, onglet **Configuration** → copier le **Internal Integration Secret** (commence par `ntn_...`). C'est le `NOTION_TOKEN`.
4. **Partager la page avec l'intégration** — étape obligatoire, sinon l'API renvoie 404 sur tout :
   - Ouvrir la page Notion "Tâches" (celle qui contient la base de données)
   - Menu `•••` en haut à droite → **Connexions** (ou **Add connections**)
   - Chercher et sélectionner l'intégration créée à l'étape 2

## 4. Récupérer l'ID de la base de données (déjà rempli dans `.env.dist`)

Si un jour la base change, l'ID se retrouve dans l'URL de la base Notion (en mode plein écran) :

```
https://www.notion.so/<workspace>/<Nom-de-la-base>-<ID SANS TIRETS>?v=...
```

L'`ID` est une suite de 32 caractères hexadécimaux ; l'API Notion accepte indifféremment avec ou sans tirets (`f92a9354bd1c82718144e1781367` ou `f92a9354-bd1c-8271-aef4-8144e1781367`).

## 5. Configurer `.env`

```bash
cp tools/cli/.env.dist tools/cli/.env
```

Éditer `tools/cli/.env` :

```bash
NOTION_TOKEN=ntn_xxx        # récupéré à l'étape 3
NOTION_DATABASE_ID=f92a...  # déjà pré-rempli, à ajuster si besoin (étape 4)
NOTION_USER_ID=             # ton ID Notion, à remplir à l'étape 7 (sinon `task start` n'assigne personne)
BASE_BRANCH=develop         # branche cible des PR
```

`tools/cli/.env` est gitignoré : il ne sera jamais commité.

## 6. Vérifier que tout fonctionne

```bash
tools/cli/vesper task list
```

Si la liste des tâches Notion s'affiche, tout est configuré.

## 7. Récupérer ton `NOTION_USER_ID`

`task start` assigne automatiquement la tâche à `NOTION_USER_ID` (propriété `Assignee`). Pour récupérer cet ID, le plus simple est de s'assigner manuellement une tâche existante dans Notion, puis de lire son ID via l'API :

```bash
curl -s -X POST "https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"page_size": 5}' | jq '.results[].properties.Assignee.people'
```

Copier le champ `id` de la personne concernée dans `NOTION_USER_ID`. (Les tokens d'intégration interne ne peuvent pas lister les utilisateurs du workspace via `/v1/users`, d'où ce détour.)

Voir `README.md` pour l'usage complet (`task start`, `task pr`).

## Problèmes fréquents

| Symptôme | Cause probable |
|---|---|
| `NOTION_TOKEN manquant` | `.env` absent ou pas rempli — refaire l'étape 5 |
| Notion API renvoie une erreur 404 / "object_not_found" | L'intégration n'est pas partagée sur la page — refaire l'étape 3.4 |
| `gh: command not found` | `gh` non installé — étape 1 |
| `gh pr create` échoue avec une erreur d'auth | `gh auth status` doit être vert — refaire l'étape 2 |
| `⚠️ NOTION_USER_ID non défini` lors de `task start` | `NOTION_USER_ID` manquant ou vide dans `.env` — refaire l'étape 7 |
