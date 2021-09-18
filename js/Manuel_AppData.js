'use strict';
/**
 * Module fonctionnant de paire avec Manuels.js, propre à 
 * l'application, qui définit l'aide
 * 
 */

const Ouvrir_preferences = "Ouvrir le panneau des préférences (⇧P)"

const ManuelData = [
  {
      operation: "Travailler une nouvelle partition"
    , procedure:["Découper ses systèmes en images séparées (à l'aide de ScoreCutting", "mettre ses systèmes dans le dossier <code>./systemes</code>", "lancer l'application, c'est prêt !"]
    , precision:"Plus tard, on pourra définir de mémoriser l'analyse, ce qui permettra de la retrouver (il faudra donne un titre"
  }
, {
      operation: "Réglage des tailles et volumes"
    , procedure: [Ouvrir_preferences, "régler la taille de l'élément voulu."]
    , precision: "On peut pratiquement régler les tailles de tous les éléments, à savoir :<ul><li>la largeur des systèmes,</li><li>la marge haute du premier système,</li><li>l'espacement entre les systèmes,</li><li>la taille des accords,</li><li>la taille des marques d'harmonie</li><li>le volume des notes</li><li>etc.</li></ul>"
  }
, {
      operation: "Activer Staves (pour travailler avec un portée et des notes)"
    , procedure: ["Jouer le raccourci clavier ⇧S."]
    , precision: "Stave est le programme qui permet d'écrire des notes sur une ou deux portées pour des illustrations.<br/>On peut ouvrir aussi son manuel avec ⇧M quand il est activé."
  }
, { 
      operation: "Ouvrir le panneau des préférences"
    , procedure: ["Jouer le raccourci clavier ⇧P"]
    , precision: "(“P” comme “Préférences”)"
  }
, {
      operation: "Déplacer un système"
    , procedure: ["Déverrouiller les systèmes s'ils sont verrouillés (“l” ou bouton pied de page),", "cliquer sur le système (relâcher la souris)", "déplacer la souris pour positionner le système", "recliquer sur le système pour le fixer."]
    , precision: "Tous les objets sous le système seront déplacés d'autant de pixels (mais pas les objets au-dessus)."
  }
, {
      operation: "Définir les valeurs par défaut"
    , procedure: ["Activer l'application", "jouer le raccourci ⇧P", "régler les propriétés dans le panneau de préférence qui s'ouvre."]
  }
, {
      operation: "Créer une nouvelle marque d'analyse"
    , procedure: ["Double-cliquer à l'endroit voulu", "régler la nouvelle marque en indiquant la marque (cf. ci-dessous"]
    , precision: `<pre><code>Prolongation   : terminer le nom par '--' ('cm--')
Modulation     : commencer la ligne par 'MOD:' ('MOD:C')
Emprunt        : commencer la ligne par 'EMP:' ('EMP:D')
Pédale         : commencer la ligne par 'PED:' ('PED:5')
</code></pre>
`
  }
, {
      operation:"Dupliquer une marque d'analyse"
    , procedure: ["Créer l'originale si nécessaire", "presser la touche ALT", "avec la touche ALT pressée, déplacer la marque d'analyse à dupliquer à l'endroit voulu."]
  }
, {
      operation: "Allonger/raccourcir la ligne de prolongation"
    , procedure: ["Sélectionner la marque d'analyse", "activer la poignée de la ligne", "déplacer la poignée pour définir la longueur", "cliquer à nouveau sur la poignée pour finir."]
    , precision: "(rappel : pour ajouter cette ligne de prolongation, il faut terminer le nom par '--', par exemple 'dm--' pour “RÉ mineur + ligne prolongation”."
  }

, {
      operation: "Changer le type de la marque"
    , procedure: ["Détruire la marque actuelle,", "créer une nouvelle marque du type voulu."]
  }
, {
      operation: 'Enregistrement de l’analyse'
    , procedure: ["Prendre une photo de l'état actuel en jouant le raccourci ⇧R ou cliquer sur l'appareil photo dans le pied de page."]
    , precision: "L'enregistrement permet de consigner toutes les opérations constructives dans le stockage local afin de pouvoir reconstruire rapidement l'état d'une partition."
  }
, {
      operation: 'Retrouver un état précédent d’analyse'
    , procedure: ['Si nécessaire, régler dans les préférences la vitesse de lecture,', 'jouer le bouton “Lire” du pied de page', 'choisir l’enregistrement voulu.']
  }

]


const ManuelShortcutsData = [
  {
      operation:'Verrouiller/déverrouiller les portées'
    , shortcut: 'l (L min.)'
    , precision: "On peut aussi utiliser le bouton de pied de page."
  }
, {
      operation:'Basculer vers Staves'
    , shortcut: '⇧S'
  }
, {
      operation: 'Passer de Staves à la Table d’analyse'
    , shortcut: '⇧T ou ⇧S'
  }
, {
      operation:  'Lancer l’enregistrement'
    , shortcut:   '⇧R'
    , precision:  '“R” comme “Recorder”. Rappel : l’enregistrement consiste à enregistrer toutes les actions constructives dans le stockage local.' 
  }
]
