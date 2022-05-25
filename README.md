# Projet Experience

Le projet Experience a pour but de fournir un boilerplate pour des applications backend NodeJS de toutes sortes

## Démarrage

### En local

Lancer la commande `npm start` dans le terminal

### En local avec Docker

Dans un premier temps, on build l'image

```shell
docker build -t experience .
```

Ensuite, on peut lancer le conteneur : 

```shell
docker run --rm --name <NOM_CONTENEUR> -p 8342:8342 experience
```
