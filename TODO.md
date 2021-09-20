## Réflexion sur l'ajustement des hauteurs

ON a ajouté la possibilité d'aligner les marques de même type. 
Comment s'y prendre ?

Faut-il :
  - associer chaque marque aux systèmes ET checker seulement les
    marques du système (efficace si on a une grande quantité de
    système)
  - garder une table qui conserve les top et bottom par tranche de
    20 (se chevauchant pour ne rien oublier) et voir presque instan
    tanément les similitudes
  - ne rien faire de plus et comparer simplement toutes les marques
    en sachant que
      1 : il n'y en aura jamais des milliers
      2 : on pourrait le faire de façon asynchrone, ce qui ne rallen-
          tirait par les opérations
      3 : javascript est rapide pour ce genre d'opération
    Je vais opter pour ce système pour le moment
## FONCTIONNALITÉS

  * [PhilHarmonieFont] Pouvoir écrire les notes en minuscule (peut-être ALT + note)
    la = æ, si = ß, do = ©, ré = ∂, mi = ê, fa = ƒ, sol = ﬁ

  * Pouvoir dupliquer les objets avec ALT - Drag

  * [pour descendre les accords et autres marques supérieurs avec le système] Avant de procéder au déplacement de tous les éléments après le déplacement d'un système, l'application demanderait d'indiquer depuis où on doit considérer les éléments à descendre. En cliquant au-dessus du premier accord ou de l'objet d'analyse le plus haut, on descendrait tout aussi

  * Pour des cercles, des segments, etc., faire pareil que l'édition, mais ne mettre que :
    'seg' ou 'cir' ou 'text:Le texte à afficher' (pas PhilHarmonieFont, donc)
    -> préférences pour les tailles (ou utiliser resizeable de jQuery, qui serait pratique, ici)

  * Pour les lignes de prolongation, fonctionner aussi avec un petit "+" 
    qui voudra dire "aller jusqu'à la prochaine marque de même nature" (accord ou harmonie)
    - note : pour le moment, les harmonies sont détectées mais pas les accords (et tester la
      première lettre ne sera pas suffisant. Peut-être en regardant si commence par a, b à g
      et ne contient pas d'espace.
      Noter qu'un texte, qui pourrait être confondu, ne peut pas l'être car il a déjà un type (txt)
      Noter que c'est la même chose pour 'seg' et 'cir' (donc le 'c' de 'cir' ne peut pas être pris
      pour un DO)

  * RECORD
    - mis en place, il faut maintenant consigner :
    * les ajouts de marque d'analyse 
    * Les marques de cadence (record OK — lecture NON)
    * les déplacements de portée
    * OK Les changements de préférences
    - pouvoir rejouer une analyse

## FONCTIONNALITÉS QUI SERAIENT PRATIQUES

  * pouvoir associer une marque d'analyse à une portée, ce qui ferait que lorsqu'on descend le système, la marque descend aussi.
