Status: ready-for-agent

# Planificateur de repas du Foyer

Vocabulaire : voir `GLOSSARY.md`. Décision de stockage : voir `docs/adr/0001-server-json-file-storage.md`.

## Problem Statement

Nous sommes deux à partager nos repas. Aujourd'hui, planifier la semaine à l'avance et tenir une liste de courses se fait de tête ou sur des supports séparés, sans que l'autre voie la même chose. Il faut un endroit partagé, rapide à utiliser sur téléphone, où l'on voit ce qu'on mange cette Semaine et ce qu'il faut acheter.

## Solution

Une application web en français, pensée d'abord pour le mobile, servie depuis le PC du Foyer sur le réseau local. Elle propose deux écrans : le planning d'une Semaine (14 Créneaux, un Repas au plus par Créneau) et la Liste de courses (une liste unique et continue, indépendante du planning). Les deux appareils voient les mêmes données, stockées dans un fichier JSON côté serveur.

## User Stories

1. En tant que membre du Foyer, je veux voir la Semaine courante à l'ouverture, afin de savoir tout de suite ce qu'on mange.
2. En tant que membre du Foyer, je veux voir les 7 jours du lundi au dimanche avec un Créneau midi et un Créneau soir, afin de planifier chaque repas.
3. En tant que membre du Foyer, je veux passer à la Semaine précédente ou suivante, afin de planifier à l'avance et de consulter l'historique.
4. En tant que membre du Foyer, je veux revenir en un geste à la Semaine courante, afin de ne pas me perdre en naviguant.
5. En tant que membre du Foyer, je veux poser un Repas dans un Créneau en saisissant son libellé libre, afin de planifier sans recette ni ingrédients.
6. En tant que membre du Foyer, je veux choisir un Repas dans la Bibliothèque pour remplir un Créneau, afin de planifier vite ce qu'on mange souvent.
7. En tant que membre du Foyer, je veux que la Bibliothèque propose les Repas filtrés pendant que je tape, afin de retrouver un Repas rapidement.
8. En tant que membre du Foyer, je veux qu'un nouveau Repas entre automatiquement dans la Bibliothèque quand je le pose, afin de ne pas faire une saisie à part.
9. En tant que membre du Foyer, je veux modifier le Repas d'un Créneau, afin de corriger une erreur ou de changer d'avis.
10. En tant que membre du Foyer, je veux vider un Créneau, afin de refléter qu'on ne mange pas prévu ou pas à la maison.
11. En tant que membre du Foyer, je veux qu'un Créneau contienne au plus un Repas, afin que le planning reste lisible.
12. En tant que membre du Foyer, je veux utiliser un libellé comme « restau » ou « chez des amis » comme un Repas ordinaire, afin de ne pas avoir de cas particulier.
13. En tant que membre du Foyer, je veux supprimer un Repas de la Bibliothèque, afin de retirer les libellés qui ne servent plus.
14. En tant que membre du Foyer, je veux que supprimer un Repas de la Bibliothèque ne modifie pas le planning déjà posé, afin de ne pas perdre l'historique des Semaines.
15. En tant que membre du Foyer, je veux voir la Liste de courses dans un écran à part, afin de l'utiliser au magasin sans le planning.
16. En tant que membre du Foyer, je veux ajouter un Article avec un libellé libre, afin de noter ce qu'il faut acheter.
17. En tant que membre du Foyer, je veux que la saisie propose les Articles déjà utilisés, afin d'ajouter vite un article habituel.
18. En tant que membre du Foyer, je veux cocher et décocher un Article, afin de suivre les courses en cours.
19. En tant que membre du Foyer, je veux retirer d'un coup les Articles cochés, afin de repartir d'une liste propre après les courses.
20. En tant que membre du Foyer, je veux supprimer un Article seul, afin de corriger une saisie ou d'écarter un article inutile.
21. En tant que membre du Foyer, je veux que la Liste de courses soit unique et continue, afin de ne pas la lier au rythme des Semaines.
22. En tant que membre du Foyer, je veux que mon compagnon ou ma compagne voie mes changements depuis son appareil, afin que nous partagions les mêmes données.
23. En tant que membre du Foyer, je veux que l'application relise les données à l'ouverture, au retour sur l'onglet et après chaque action, afin de voir les changements de l'autre sans recharger.
24. En tant que membre du Foyer, je veux une interface utilisable au pouce sur téléphone et correcte sur ordinateur, afin de cocher les courses au magasin et planifier sur le canapé.
25. En tant que membre du Foyer, je veux une interface en français, afin de la lire naturellement.
26. En tant que développeur du Foyer, je veux lancer `npm run dev:lan` et voir l'URL à ouvrir sur le téléphone, afin de tester sur le réseau local sans chercher l'adresse.
27. En tant que développeur du Foyer, je veux que les données soient dans un fichier JSON lisible et modifiable à la main, afin de sauvegarder en le copiant et de le corriger depuis le PC.
28. En tant que développeur du Foyer, je veux qu'une Semaine absente du fichier se lise comme une Semaine vide, afin de naviguer vers l'avenir sans préparation.
29. En tant que développeur du Foyer, je veux que l'écriture du fichier soit atomique, afin qu'un plantage ne le corrompe pas.

## Implementation Decisions

- **Modèle** : un seul Foyer, sans notion de compte. Une Semaine va du lundi au dimanche et est identifiée par sa date de début. Un Créneau est identifié par une Semaine, un jour et un moment (midi ou soir). Il contient au plus un Repas, un libellé libre. Un Article est un libellé libre avec un état coché ou non. Aucun concept d'ingrédient, de recette, de quantité ni de catégorie.
- **Bibliothèque** : l'ensemble des libellés de Repas déjà posés, sans doublon (comparaison insensible à la casse et aux espaces de bord). Un Repas y entre à la pose et peut en être supprimé, sans effet sur les Créneaux existants.
- **Liste de courses** : une liste unique, indépendante des Semaines et du planning. Les suggestions de saisie viennent des libellés d'Articles déjà utilisés, avec la même normalisation que la Bibliothèque. L'action « retirer les Articles cochés » supprime toutes les lignes cochées.
- **Stockage** (ADR 0001) : un fichier JSON unique dans un dossier `data/` hors git. Il est lu et écrit par des routes serveur Next.js. Écriture atomique par fichier temporaire puis renommage. La dernière écriture gagne en cas de modification simultanée. Le chemin du fichier est configurable pour permettre aux tests d'utiliser un fichier temporaire. Un fichier absent se lit comme des données vides.
- **API HTTP** : routes serveur Next.js qui exposent la lecture et l'écriture des Semaines (pose, modification et vidage d'un Créneau), de la Bibliothèque (liste, suppression) et de la Liste de courses (liste, ajout, cochage, suppression d'un Article, retrait des cochés). C'est le point de test unique de la fonctionnalité.
- **Interface** : français, mobile d'abord, ordinateur correct. Deux écrans : planning d'une Semaine avec navigation précédente/suivante et retour à la Semaine courante, et Liste de courses. Actualisation par relecture des données à l'ouverture, au retour sur l'onglet et après chaque action. Pas de temps réel.
- **Code** : noms en anglais (`Slot`, `Meal`, `Item`, etc.), interface en français, correspondances dans `GLOSSARY.md`.
- **Réseau local** : un script `npm run dev:lan` lance `next dev -H 0.0.0.0` et affiche l'URL du PC sur le réseau local.
- **Next.js** : cette version a des changements incompatibles avec les conventions connues. Lire le guide correspondant dans `node_modules/next/dist/docs/` avant d'écrire du code (voir `AGENTS.md`).

## Testing Decisions

- **Ce qu'est un bon test** : il vérifie le comportement externe observable par l'API (ce qu'une requête renvoie, ce que le fichier contient ensuite), jamais l'implémentation interne.
- **Un seul point de test** : les handlers de l'API HTTP, appelés directement, avec un fichier de données temporaire par test. Aucun test de composants React, aucun test de bout en bout en phase 1 ; l'interface se vérifie à la main sur un téléphone.
- **À couvrir** : un Créneau contient au plus un Repas ; poser, modifier et vider un Créneau ; un Repas posé entre dans la Bibliothèque sans doublon ; supprimer un Repas de la Bibliothèque laisse le planning intact ; ajouter, cocher, supprimer un Article ; retirer les cochés ; Semaine absente = Semaine vide ; fichier absent = données vides ; écriture atomique (pas de fichier tronqué laissé en place).
- **Prior art** : aucun. Le dépôt n'a ni test ni framework. Ajouter un framework léger (Vitest par exemple) fait partie du travail.

## Out of Scope

- Authentification et vrai backend (plus tard ; seule la couche de stockage changera).
- Recettes, ingrédients, quantités, unités, catégories, déduction de la Liste de courses depuis le planning.
- Copie d'une Semaine vers une autre.
- Temps réel entre appareils.
- Export/import dans l'interface (le fichier JSON suffit).
- Attribution de qui a ajouté ou coché quoi.
- Plusieurs Foyers, plusieurs langues, petit-déjeuner et autres Créneaux.
- Gestion de stock, tests de composants et de bout en bout.

## Further Notes

- Le besoin initial parlait d'une liste de courses « qui se génère toute seule ». Il a été remplacé par une liste indépendante avec auto-complétion. À ne pas réintroduire sans accord.
- Plus tard, si le Foyer le demande, la Bibliothèque pourrait porter des ingrédients pour réalimenter la Liste de courses ; ce n'est pas prévu.
