'use strict';

function onChooseTypeCadende(type){
  console.info("Vous avez choisi le type "+ type)
}

$(document).ready(function(e){
  Message.init()
  Piano.loadAllNotes()
  UI.setInterface()
  initMidi()
  Duplex.init()// interconnexion avec Staves

})
