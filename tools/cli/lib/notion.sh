#!/usr/bin/env bash
# Wrappers autour de l'API Notion pour la base de données "Tâches".

NOTION_API="https://api.notion.com/v1"
NOTION_VERSION="2022-06-28"

notion_api() {
  local method=$1 path=$2 data=${3:-}
  local args=(-s -X "$method" "${NOTION_API}${path}"
    -H "Authorization: Bearer ${NOTION_TOKEN}"
    -H "Notion-Version: ${NOTION_VERSION}"
    -H "Content-Type: application/json")
  if [[ -n "$data" ]]; then
    args+=(-d "$data")
  fi
  local response
  response=$(curl "${args[@]}")
  if [[ "$(jq -r '.object // empty' <<<"$response")" == "error" ]]; then
    die "Notion API: $(jq -r '.message' <<<"$response")"
  fi
  echo "$response"
}

# Récupère la page de tâche correspondant à l'ID (colonne "ID", type unique_id).
notion_find_task() {
  local id=$1
  local filter response
  filter=$(jq -n --argjson id "$id" '{filter: {property: "ID", unique_id: {equals: $id}}}')
  response=$(notion_api POST "/databases/${NOTION_DATABASE_ID}/query" "$filter")
  local count
  count=$(jq '.results | length' <<<"$response")
  [[ "$count" -gt 0 ]] || die "Aucune tâche avec l'ID ${id} trouvée dans Notion."
  jq '.results[0]' <<<"$response"
}

notion_task_page_id() { jq -r '.id' <<<"$1"; }
notion_task_url() { jq -r '.url' <<<"$1"; }
notion_task_name() { jq -r '.properties["Nom"].title | map(.plain_text) | join("")' <<<"$1"; }
notion_task_type() { jq -r '.properties["Type"].select.name // ""' <<<"$1"; }
notion_task_status() { jq -r '.properties["État"].status.name // ""' <<<"$1"; }

# La propriété "Branche" est une formule qui vaut "git checkout -b <branche>".
notion_task_branch() {
  local formula
  formula=$(jq -r '.properties["Branche"].formula.string // ""' <<<"$1")
  [[ -n "$formula" ]] || die "La propriété Branche est vide pour cette tâche."
  echo "${formula#git checkout -b }"
}

notion_update_status() {
  local page_id=$1 status=$2
  local body
  body=$(jq -n --arg status "$status" '{properties: {"État": {status: {name: $status}}}}')
  notion_api PATCH "/pages/${page_id}" "$body" >/dev/null
}

# Ajoute un commentaire sur la page avec un lien (ex: l'URL de la PR).
notion_add_comment() {
  local page_id=$1 text=$2 url=$3
  local body
  body=$(jq -n --arg page "$page_id" --arg text "$text" --arg url "$url" '
    {
      parent: {page_id: $page},
      rich_text: [
        {type: "text", text: {content: $text, link: {url: $url}}}
      ]
    }')
  notion_api POST "/comments" "$body" >/dev/null
}
