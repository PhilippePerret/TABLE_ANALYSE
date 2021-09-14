'use strict';
/**
 * Class PianoClass
 * ----------------
 * Pour jouer les notes de piano
 * 
 * En bas de ce module se trouve l'initialisation du module 
 * WebMidi
 * 
 */

const NOTES_MAJ = ['C','Cd','D','Dd','E','F','Fd','G','Gd','A','Ad','B']

class PianoClass {

  play(note, octave, params){
    const my = this
    note = note.toUpperCase()
    const at = this.tagsNotes[note+octave]
    if (at){
      at.play()
        .then( e => {
          if ( params && params.duration ) {
            setTimeout(my.stop.bind(my, note,octave), params.duration * 1000)
          }
        })
        .catch(this.errorNoUserGestureActivate.bind(this))
    }
  }
  stop(note, octave){
    // console.log("Je dois couper '%s%s' ", note, octave)
    const at = this.tagsNotes[note+octave]
    if (at) {
      var rest = 0
      if ( at.currentTime < Pref.minimum_duree_notes ) {
        rest = Pref.minimum_duree_notes - at.currentTime
        // console.log("Il reste ce nombre de secondes à jouer : ", rest)
      }
      this.timerStopNote = setTimeout(this.proceedStopNote.bind(this, at), rest * 1000)
    }
  }
  /**
   * Procède véritablement à l'arrêt de la note +at+
   */
  proceedStopNote(at){
    at.pause()
    at.currentTime = 0
    clearTimeout(this.timerStopNote)
    this.timerStopNote = null
  }

  /**
   * Pour pouvoir jouer les sons, il faut activer le piano par
   * un geste de l'utilisateur
   * 
   */
  activate(){
    DGet('footer button#btn-activer-son').remove()
    const taga = this.tagsNotes['C0']
    // console.log("taga = ", taga)
    const lastVolume = taga.volume
    // console.log("Volume actuel : ", lastVolume)
    taga.volume = 0.1 // ne fonctionne pas, apparemment
    this.play('C',0, {duration:1})
    taga.volume = lastVolume
    // console.log("Volume remis à : ", taga.volume)
  }

  /**
   * Appelé lorsqu'on essaie de jouer une note alors qu'on n'a pas
   * encore activé la librairie par un "User Gesture"
   * 
   */
  errorNoUserGestureActivate(err){
    if ( String(err).match(/the user didn't interact/) ){
      erreur("Il faut activer la librairie son en cliquant sur le bouton “Activer le son” dans le pied de page !")
    } else {
      console.error("AUTRE ERREUR : ", err)
    }
  }

  /**
   * Chargement de tous les sons au démarrage
   * 
   */
  loadAllNotes(){
    // console.log("-> Piano.loadAllNotes")
    /*
     * La table qui va contenir toutes les tags audio des notes
     *
     */
    this.tagsNotes = {}
    for (var ioctave = 0; ioctave < 4; ++ ioctave){
      NOTES_MAJ.forEach(note => {
        this.buildNote(note, ioctave)
      })
    }
    this.buildNote('C', 4)
  }

  buildNote(note, octave){
    const o = DCreate('AUDIO', {id:`note-${note}${octave}`})
    const s = DCreate('SOURCE', {src:`sons/${note}${octave}.ogg`, type:'audio/ogg'})
    o.appendChild(s)
    document.body.appendChild(o)
    Object.assign(this.tagsNotes, {[note.replace(/d/,'#')+octave]: o})
    o.addEventListener('loadeddata', e => {
      // console.log("Note %s%s chargée", note, octave)
      o.volume = Pref.note_volume
    })
  }

}
const Piano = new PianoClass()


function initMidi(){
  WebMidi.enable(function (err) {
    if (err) {
      console.log("WebMidi could not be enabled.", err);
      erreur("Je n'ai pas pu activer le module WebMidi… L'usage des notes ne sera pas possible…")
    } else {
      console.log("WebMidi enabled!");
      // console.log(WebMidi.inputs);
      // console.log(WebMidi.outputs);
      const input = WebMidi.inputs[0];
      if ( input ) {
        Piano.MIDI_ON = true
        input.addListener('noteon', "all", function(e) {
          Piano.play(e.note.name, e.note.octave)
          if ( UI.StavesON ) {
            Duplex.send({operation:'NOTE', note:e.note})
          }
        });
        input.addListener('noteoff', 'all', function(e){
          Piano.stop(e.note.name, e.note.octave)
        })
      } else {
        console.info("Pas de clavier MIDI branché.")
        Piano.MIDI_ON = false
      }
    }
  
  });
}

