# Repas

Planificateur de repas partagé par un couple : on planifie les repas de la semaine à venir, et on tient à part une liste de courses.

## Language

**Foyer**:
Le groupe de personnes (ici le couple) qui partage le même planning et la même Liste de courses. Il n'y en a qu'un.
_Avoid_: Compte, famille, utilisateur

**Semaine**:
Unité de planification : sept jours, du lundi au dimanche, planifiée à l'avance.
_Avoid_: Planning (désigne l'ensemble des Créneaux d'une Semaine)

**Créneau**:
Un emplacement du planning : un jour de la Semaine, à midi ou le soir. Il contient au plus un Repas.
_Avoid_: Slot, service

**Repas**:
Le nom libre de ce qu'on mange dans un Créneau (ex. « pâtes bolo », « salade carottes tomates oignons »). Un simple libellé, sans recette ni ingrédients structurés.
_Avoid_: Recette, plat

**Bibliothèque**:
L'historique des Repas déjà planifiés, proposés à nouveau pour remplir un Créneau.
_Avoid_: Catalogue, livre de recettes

**Liste de courses**:
La liste unique et continue des Articles à acheter, tenue à la main et indépendante des Semaines et du planning.
_Avoid_: Panier

**Article**:
Une ligne de la Liste de courses : un libellé libre (« lait », « 2 kg de pommes ») qui est coché ou non. Sans quantité, unité ni catégorie structurées.
_Avoid_: Ingrédient, produit, item
