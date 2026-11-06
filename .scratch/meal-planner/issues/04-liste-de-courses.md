# 04: Liste de courses : ajouter, cocher, supprimer

**What to build:** un écran Courses à part, avec une liste unique et continue, indépendante des Semaines et du planning. On ajoute un Article en libellé libre, on le coche et décoche, on le supprime seul. La saisie propose les Articles déjà utilisés (même normalisation que la Bibliothèque). Un bouton « retirer les cochés » supprime toutes les lignes cochées. L'API HTTP expose ces opérations et est couverte par des tests.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Ajouter un Article libre apparaît dans la liste
- [ ] Cocher et décocher un Article, et le conserver après rechargement
- [ ] Supprimer un Article seul
- [ ] « Retirer les cochés » supprime toutes les lignes cochées et seulement celles-là (testé via l'API)
- [ ] La saisie propose les Articles déjà utilisés
- [ ] La liste n'est liée ni au planning ni à une Semaine
- [ ] Tests de l'API passent
