'use strict';

class InterconnexionWithStaves {
  init(){
    this.duplex = new Interconnexion({name:'Table <-> Staves', other: UI.panneauStave.contentWindow})
    this.duplex.receive = this.receive.bind(this)
  }
  send(data){ this.duplex.send(data) }
  
  receive(data){
    // console.log("J'ai reçu ça de Staves :", data)
    switch(data.operation){
      case 'PLAY':
        // console.log("Je dois jouer : ", data.note)
        Piano.play(data.note.note, data.note.octave, {duration: 1})
        break
      case 'activateTableAnalyse':
        UI.panneauStave.classList.add('hidden')
        document.body.focus()
        break;
    }
  }

  // --- Autres méthodes ---
  openStaves(){
    this.send({operation:'ACTIVATE'})
    UI.panneauStave.classList.remove('hidden')    
  }
}
const Duplex = new InterconnexionWithStaves()
