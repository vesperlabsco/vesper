---
description: Démarre une tâche Notion — crée et pousse la branche, passe le statut à "En cours"
argument-hint: <id>
allowed-tools: Bash(tools/cli/vesper:*)
---

Exécute à la racine du repo :

```
tools/cli/vesper task start $ARGUMENTS
```

Rapporte le résultat de façon concise (numéro de tâche, nom de la branche créée, confirmation du changement de statut Notion). En cas d'erreur, explique la cause sans relancer automatiquement la commande.
