---
description: Ouvre la PR de fin de tâche — crée la PR GitHub, passe le statut Notion à "Pull Request", commente le lien
argument-hint: "[id] [--desc \"description de l'action\"]"
allowed-tools: Bash(tools/cli/vesper:*)
---

Exécute à la racine du repo :

```
tools/cli/vesper task pr $ARGUMENTS
```

Si aucun id n'est passé dans les arguments, la commande le déduit du nom de la branche courante — c'est le comportement normal, ne pas essayer de le fournir toi-même.

Rapporte le résultat de façon concise (lien de la PR créée, confirmation du changement de statut Notion et de l'ajout du commentaire). En cas d'erreur, explique la cause sans relancer automatiquement la commande.
