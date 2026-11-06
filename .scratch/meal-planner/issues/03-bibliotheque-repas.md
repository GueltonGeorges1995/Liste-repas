# 03: Bibliothèque : réutiliser un Repas

**What to build:** un Repas posé dans un Créneau entre automatiquement dans la Bibliothèque, sans doublon (comparaison insensible à la casse et aux espaces de bord). Le champ de saisie d'un Créneau propose les Repas de la Bibliothèque, filtrés pendant la frappe. On peut supprimer un Repas de la Bibliothèque sans modifier les Créneaux déjà planifiés.

**Blocked by:** 02

**Status:** ready-for-agent

- [x] Poser un nouveau Repas l'ajoute à la Bibliothèque
- [x] « Pâtes bolo » et « pâtes bolo  » ne donnent qu'une entrée
- [ ] Les suggestions se filtrent pendant la frappe et un choix remplit le Créneau
- [x] Supprimer un Repas de la Bibliothèque laisse intacts les Créneaux déjà planifiés (testé via l'API)
- [x] Tests de l'API passent
