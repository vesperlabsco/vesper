# TODO

- [ ] Installer l'extension Claude in Chrome (`/chrome` dans Claude Code) pour permettre la lecture de la console navigateur (erreurs JS, réseau, screenshots) pendant le dev du front.
- [ ] Restreindre l'accès de Claude Code au projet — choisir une des deux options :
  - [ ] Option A : faire tourner Claude Code directement dans le conteneur Docker du front (une fois `docker/` et le `Makefile` en place) pour limiter son accès filesystem/réseau à ce qui est monté dans le conteneur.
  - [ ] Option B : configurer les permissions Claude Code (`settings.json`) pour restreindre les outils/chemins accessibles, sans passer par Docker.
- [ ] Mise en place du CLI Notion.
- [ ] Mise en place du CLI Git.
- [ ] Mise en place des workflows et commandes.
