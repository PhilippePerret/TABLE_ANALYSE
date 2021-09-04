'use strict';

/**
 * Préférences propres à l'application
 * 
 */

const PreferencesAppData = [
    {type:'inputtext', id:'systeme_width',          default:1860, label:"Largeur (en pixels) des systèmes", selector:'img.systeme', selector_value:"width:__VALUE__px;"}
  , {type:'inputtext', id:'top_first_system',       default:50,   label:"Décalage haut du premier système (en pixels)"}
  , {type:'inputtext', id:'distance_systemes',      default:50,   label:"Distance par défaut (en pixels) des système"}
  , {type:'inputtext', id:'marque_accords_size',    default:60,   label:"Taille des marques d'accord", unite:'px',   selector:'div.aobj.acc', selector_value:'font-size:__VALUE__px;'}
  , {type:'inputtext', id:'marque_harmonie_size',   default:60,   label:"Taille des marques d'harmonie", unite:'px', selector:'div.aobj.har, div.aobj.cad', selector_value:'font-size:__VALUE__px;'}
  , {type:'inputtext', id:'marque_modulation_size', default:60,   label:"Taille des marques d'harmonie", unite:'px', selector:'div.aobj.mod, div.aobj.emp', selector_value:'font-size:__VALUE__px;'}
  , {type:'inputtext', id:'marque_pedale_size',     default:40,   label:"Taille des pédales",       unite:'px', selector:'div.aobj.ped span.content', selector_value:'font-size:__VALUE__px;width:calc(__VALUE__px / 2);height:calc(__VALUE__px / 2);line-height:calc(__VALUE__px / 2);'}
  , {type:'inputtext', id:'marque_texte_size_1',    default:70,   label:"Taille des gros textes",   unite:'px', selector:'div.amark.txt.size1 span.content',   selector_value:'font-size:__VALUE__px;'}
  , {type:'inputtext', id:'marque_texte_size_2',    default:50,   label:"Taille des textes moyens", unite:'px', selector:'div.amark.txt.size2 span.content', selector_value:'font-size:__VALUE__px;'}
  , {type:'inputtext', id:'marque_texte_size_3',    default:30,   label:"Taille des petits textes", unite:'px', selector:'div.amark.txt.size3 span.content', selector_value:'font-size:__VALUE__px;'}
  , {type:'inputtext', id:'note_volume',            default:0.5,  label:"Volume de départ des notes (entre 0.0 — silence – et 1.0 — volume max."}
]

const Pref = Preferences.data
function isTruePref(key) { return Number(Pref[key]) == '1' }

Pref.note_volume            = parseFloat(Pref['note_volume'])
Pref.systeme_width          = Number(Pref['systeme_width'])
Pref.top_first_system       = Number(Pref['top_first_system'])
Pref.distance_systemes      = Number(Pref['distance_systemes'])
Pref.marque_accords_size    = Number(Pref['marque_accords_size'])
Pref.marque_harmonie_size   = Number(Pref['marque_harmonie_size'])
Pref.marque_modulation_size = Number(Pref['marque_modulation_size'])
Pref.marque_pedale_size     = Number(Pref['marque_pedale_size'])
// Pref.keep_octave_midi       = isTruePref('keep_octave_midi')
