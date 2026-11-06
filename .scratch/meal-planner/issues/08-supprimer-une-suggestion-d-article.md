# 08: Supprimer une suggestion d'Article

**What to build:** sur l'écran Courses, quand « Anciens articles » est affiché, un × à côté de chaque suggestion la retire de l'historique (ex. une faute de frappe comme « efzef »). Comme la Bibliothèque (ticket 03), la suppression n'a aucun effet sur les Articles déjà dans la Liste de courses, cochés ou non. Si le même libellé est ajouté plus tard, il revient dans l'historique. Nécessite une route d'API et une opération de stockage, avec tests.

**Blocked by:** 07

**Status:** ready-for-agent

- [ ] Un × par suggestion retire le libellé de l'historique
- [ ] Les Articles présents dans la Liste de courses ne changent pas
- [ ] Rajouter le même libellé le fait revenir dans l'historique
- [ ] Tests de l'API et du stockage
