#!/usr/bin/env bash
# Utilitaires partagés par le CLI vesper.

set -euo pipefail

CLI_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "${CLI_DIR}/../.." && pwd)"

die() {
  echo "Erreur: $*" >&2
  exit 1
}

require_bin() {
  command -v "$1" >/dev/null 2>&1 || die "'$1' est requis mais introuvable dans le PATH."
}

load_env() {
  if [[ -f "${CLI_DIR}/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "${CLI_DIR}/.env"
    set +a
  fi

  : "${NOTION_TOKEN:?NOTION_TOKEN manquant. Copie tools/cli/.env.dist vers tools/cli/.env et renseigne-le.}"
  : "${NOTION_DATABASE_ID:?NOTION_DATABASE_ID manquant. Copie tools/cli/.env.dist vers tools/cli/.env et renseigne-le.}"
  BASE_BRANCH="${BASE_BRANCH:-develop}"
}

# Extrait le premier groupe de chiffres en tête de chaîne (ex: "5-test" -> "5").
leading_number() {
  local input=$1
  [[ "$input" =~ ^([0-9]+) ]] || die "Impossible d'extraire un ID de tâche depuis '${input}'."
  echo "${BASH_REMATCH[1]}"
}

current_branch() {
  git -C "${REPO_ROOT}" rev-parse --abbrev-ref HEAD
}

# Coupe la commande si le working tree a des fichiers modifiés/non suivis à commit ou stash.
require_clean_worktree() {
  local action=$1
  if [[ -n "$(git -C "${REPO_ROOT}" status --porcelain)" ]]; then
    echo "⚠️  Working tree non propre (fichiers modifiés ou non suivis)." >&2
    die "commit ou stash tes changements avant de ${action}."
  fi
}
