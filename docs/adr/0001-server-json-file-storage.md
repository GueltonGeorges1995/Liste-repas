# Données stockées dans un fichier JSON côté serveur

Pour la phase 1, les données (planning, Bibliothèque, Liste de courses) vivent dans un fichier JSON lu et écrit par des routes serveur Next.js, et non dans le localStorage. Les deux membres du Foyer, sur des appareils différents, voient ainsi les mêmes données dès le test en réseau local, et le fichier peut être édité directement depuis le PC. Le localStorage, plus simple, aurait donné un jeu de données par navigateur, sans synchronisation.

L'authentification et un vrai backend viendront plus tard : seule la couche de stockage devra changer.
