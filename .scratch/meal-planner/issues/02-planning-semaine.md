# 02: Planning d'une Semaine : poser et vider un Repas

**What to build:** l'écran Planning affiche la Semaine courante (lundi→dimanche, un Créneau midi et un Créneau soir par jour), avec navigation précédente/suivante et un retour en un geste à la Semaine courante. On pose le Repas d'un Créneau en saisissant un libellé libre, on le modifie, on le vide. Un Créneau contient au plus un Repas. « Restau » est un Repas ordinaire. Une Semaine absente du fichier s'affiche vide. L'API HTTP expose ces opérations et est couverte par des tests.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] La Semaine courante s'ouvre par défaut, du lundi au dimanche, 14 Créneaux
- [ ] Navigation vers les Semaines passées et futures, et retour à la Semaine courante
- [ ] Poser, modifier et vider le Repas d'un Créneau
- [x] Un Créneau ne peut jamais contenir plus d'un Repas (testé via l'API)
- [x] Une Semaine absente du fichier se lit comme vide (testé via l'API)
- [x] Les données persistent dans le fichier JSON après rechargement
- [x] Tests de l'API passent
