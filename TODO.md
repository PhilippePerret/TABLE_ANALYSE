## BUGS MAJEURS

  * [BUG] Proportionner la taille du rond de pédale à la font-size des préférences pour les marques
    - ça joue sur la taille de la marque mettre un pourcentage de la taille choisie (80 % pour le moment)
    - ça joue sur le width/heigth du span.content contenant le chiffre
  * [BUG] Proportionner le top de div.mtype (pour cadence pour le moment) en fonction de la taille de la
    font d'harmonie (donc de cadence) — je crois qu'il faut mettre 14 ou 16 de plus

## BUG MINEURS

  * [BUG] Tenir compte d'un maximum de préférences à leur modification (vérifier à la fermeture des préférences).
  * [BUG] Quand on lance/arrête l'enregistrement par MAJ-R, il faut aussi "toggler" le bouton du footer

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
