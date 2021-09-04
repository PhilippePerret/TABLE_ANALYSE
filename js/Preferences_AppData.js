'use strict';

/**
 * Préférences propres à l'application
 * 
 */

const PreferencesAppData = [
    {type:'inputtext', id:'systeme_width',        default:1860, label:"Largeur (en pixels) des systèmes", selector:'img.systeme', selector_value:"width:__VALUE__px;"}
  , {type:'inputtext', id:'top_first_system',     default:50,   label:"Décalage haut du premier système (en pixels)"}
  , {type:'inputtext', id:'distance_systemes',    default:50,   label:"Distance par défaut (en pixels) des système"}
  , {type:'inputtext', id:'marque_accords_size',  default:60,   label:"Taille (en pixels) des marques d'accord", selector:'div.aobj.acc', selector_value:'font-size:__VALUE__px;'}
  , {type:'inputtext', id:'marque_harmonie_size', default:60,   label:"Taille (en pixels) des marques d'harmonie", selector:'div.aobj.har', selector_value:'font-size:__VALUE__px;'}
  , {type:'inputtext', id:'note_volume',          default:0.5,  label:"Volume de départ des notes (entre 0.0 — silence – et 1.0 — volume max."}
]

const Pref = Preferences.data
function isTruePref(key) { return Number(Pref[key]) == '1' }

Pref.note_volume            = parseFloat(Pref['note_volume'])
Pref.systeme_width          = Number(Pref['systeme_width'])
Pref.top_first_system       = Number(Pref['top_first_system'])
Pref.distance_systemes      = Number(Pref['distance_systemes'])
Pref.marque_accords_size    = Number(Pref['marque_accords_size'])
Pref.marque_harmonie_size   = Number(Pref['marque_harmonie_size'])
// Pref.keep_octave_midi       = isTruePref('keep_octave_midi')
