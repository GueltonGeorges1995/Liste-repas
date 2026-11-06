# 07: Suggestions d'Articles sur demande

**What to build:** sur l'écran Courses, les suggestions ne s'affichent plus d'elles-mêmes pendant la saisie. Un bouton « Anciens articles » affiche l'historique des Articles déjà utilisés, filtré par ce qui est tapé (même normalisation qu'avant) ; un second appui le masque. Choisir une suggestion ajoute l'Article. Les suggestions sont masquées après chaque ajout réussi, qu'il vienne du champ ou d'une suggestion. Champ vide : tout l'historique est affiché. Seul l'affichage change : l'API et le stockage sont inchangés. Pas de suppression de suggestion ici (voir 08).

**Blocked by:** 05

**Status:** done

- [x] Taper dans le champ n'affiche aucune suggestion
- [x] « Anciens articles » affiche l'historique, filtré pendant la saisie, et le masque au second appui
- [x] Champ vide : tout l'historique est affiché
- [x] Choisir une suggestion ajoute l'Article ; après tout ajout réussi, les suggestions sont masquées
- [x] Aucun changement d'API (tests existants verts)
