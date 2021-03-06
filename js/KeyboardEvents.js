function onKeypressByDefault(e){

  switch(e.key){

    case 'l':
      UI.toggleLockStaves.call(UI)
      return stopEvent(e)

    case 'M':
      console.log("Je dois ouvrir le manuel")
      Manuel.toggle.call(Manuel);break

    case 'P':
      console.log("Je dois ouvrir les préférences")
      Preferences.toggle.call(Preferences);break

    case 'R':
      Recorder.toggle.call(Recorder);break

    case 'S':
      UI.toggleStaves();break;

    default:

      console.log("e.key = '%s'", e.key)
  }
}
window.onkeypress = onKeypressByDefault


window.onkeydown = function(e){
  // console.log("[KEY DOWN] e.key = '%s'", e.key)
}

functionOnKeyUp = function(e){
  // console.log("[KEY UP] e.key = '%s'", e.key)
  switch(e.key){
    case 'Backspace':
      AObjet.removeCurrentSelection()
      break
  }
} 

window.onkeyup = functionOnKeyUp.bind(null)
