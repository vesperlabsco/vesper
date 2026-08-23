# Installation

Copier le fichier ***docker/.env.dist*** vers le fichier ***docker/.env***.

Mettre à jour le paramètre *APP_USER_UID* dans le fichier *docker/.env*.
Le *APP_USER_UID* doit contenir l'identifiant de l'utilisateur.

Lancer dans un shell, la commande suivante et récupérer la valeur obtenue.
```
id -u
1000
```

Lancer la création des containers via la commande `make install`.

> Le back (`pyproject.toml`) et le front (`package.json`) ne sont pas encore scaffoldés dans `src/back` et `src/front` — tant que ce n'est pas fait, `make install` construit et démarre bien les containers, mais les étapes `uv sync` / `npm install` ainsi que les serveurs de dev (`back`, `front`) échouent. Cette note sera à retirer une fois le scaffolding en place.

# URLs d'accès

## FRONT APP:
url : http://localhost:3000

## FRONT — Bureau virtuel (noVNC)

Pour regarder Playwright tourner en mode headed (display Xvfb du container front) :

url : http://localhost:6080/vnc_auto.html

⚠️ Ne pas s'arrêter à `http://localhost:6080` seul : ça ouvre la page d'accueil noVNC (bouton "Connect" à cliquer manuellement). Il faut le chemin complet `/vnc_auto.html` pour se connecter automatiquement au display.

## BACK APP:
url : http://localhost:9000

## SMTP4DEV (mailcatcher):
url : http://localhost:5000/

## Administration de la base de données

url: http://localhost:8080/?pgsql=db&username=app_user

Système : PostgreSQL

Mot de passe app_user : password

# Information

## Lancement des containers

Lancer les containers via la commande `make start`.

## Arrêter les containers

Arrêter les containers via la commande `make stop`.

## Redémarrer les containers

Redémarrer les containers via la commande `make restart`.

## Statut des containers

Afficher le statut des containers via la commande `make status`.

## Tout supprimer

Supprimer les containers via la commande `make down`, ou `make uninstall` (identique — supprime aussi les volumes si `VOLUMES=yes` est passé, ex. `make uninstall VOLUMES=yes`).

## Lancer les migrations de base de données

Lancement des migrations via la commande `make migrate`.

Créer une nouvelle migration via la commande `make migration NAME="nom de la migration"`.

## Se connecter au container en sh

### Front
Se connecter au container via la commande `make sh_front`.

### Back
Se connecter au container via la commande `make sh_back`.

### Base de données
Se connecter au container via la commande `make sh_db`.

## Afficher les logs des différents containers

### Front
Afficher les logs via la commande `make log_front`.

### Back
Afficher les logs via la commande `make log_back`.

### Bdd
Afficher les logs via la commande `make log_db`.

### Adminer
Afficher les logs via la commande `make log_adminer`.

### Smtp4dev
Afficher les logs via la commande `make log_smtp4dev`.

## Qualité de code — Back (uv)

Lint via la commande `make back_lint`.

Formatage via la commande `make back_format`.

Vérification de types (mypy strict) via la commande `make back_typecheck`.

Tests via la commande `make back_test`.

## Qualité de code — Front (npm)

Lint via la commande `make front_lint`.

Tests via la commande `make front_test`.

Build via la commande `make front_build`.
