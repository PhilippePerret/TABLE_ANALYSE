'use strict';

/**
 * Préférences propres à l'application
 * 
 */

const PreferencesAppData = [
    {type:'inputtext', typeV:'number',  id:'systeme_width',          default:1860,  label:"Largeur (en pixels) des systèmes", selector:'img.systeme', selector_value:"width:__VALUE__px;"}
  , {type:'inputtext', typeV:'number',  id:'top_first_system',       default:50,    label:"Décalage haut du premier système (en pixels)"}
  , {type:'inputtext', typeV:'number',  id:'distance_systemes',      default:50,    label:"Distance par défaut (en pixels) des système"}
  , {type:'checkbox',  typeV:'boolean', id:'adjust_same_mark',       default:1,     label:"Ajuster en hauteur les marques de même type"}
  , {type:'inputtext', typeV:'number',  id:'marque_accords_size',    default:60,    label:"Taille des marques d'accord", unite:'px',   selector:'div.aobj.acc', selector_value:'font-size:__VALUE__px;'}
  , {type:'inputtext', typeV:'number',  id:'marque_harmonie_size',   default:60,    label:"Taille des marques d'harmonie", unite:'px', selector:'div.aobj.har, div.aobj.cad', selector_value:'font-size:__VALUE__px;'}
  , {type:'inputtext', typeV:'number',  id:'marque_modulation_size', default:60,    label:"Taille des marques d'harmonie", unite:'px', selector:'div.aobj.mod, div.aobj.emp', selector_value:'font-size:__VALUE__px;'}
  , {type:'inputtext', typeV:'number',  id:'marque_pedale_size',     default:40,    label:"Taille des pédales",       unite:'px', selector:'div.aobj.ped span.content', selector_value:'font-size:__VALUE__px;width:calc(__VALUE__px / 2);height:calc(__VALUE__px / 2);line-height:calc(__VALUE__px / 2);'}
  , {type:'inputtext', typeV:'number',  id:'marque_texte_size_1',    default:70,    label:"Taille des gros textes",   unite:'px', selector:'div.amark.txt.size1 span.content',   selector_value:'font-size:__VALUE__px;'}
  , {type:'inputtext', typeV:'number',  id:'marque_texte_size_2',    default:50,    label:"Taille des textes moyens", unite:'px', selector:'div.amark.txt.size2 span.content', selector_value:'font-size:__VALUE__px;'}
  , {type:'inputtext', typeV:'number',  id:'marque_texte_size_3',    default:30,    label:"Taille des petits textes", unite:'px', selector:'div.amark.txt.size3 span.content', selector_value:'font-size:__VALUE__px;'}
  , {type:'inputtext', typeV:'float',   id:'note_volume',            default:0.5,   label:"Volume de départ des notes (entre 0.0 — silence – et 1.0 — volume max."}
  , {type:'inputtext', typeV:'number',  id:'vitesse_relecture',      default:20,    label:"Vitesse de la relecture (de 1 à 100)", precision:"Ça détermine le temps d'affichage d'un objet en mode relecture. Avec la valeur 100, tous les objets sont à peu près ré-écrit en même temps."}
  , {type:'inputtext', typeV:'number',  id:'minimum_duree_notes',    default:0.5,   label:"Durée minimum des notes jouées (secondes)", precision:"Même si une note est “piquée” sur le clavier, elle sera jouée ce temps."}
]

const Pref = Preferences.data
function isTruePref(key) { return Number(Pref[key]) == '1' }
Preferences.setPrefExactValues()
