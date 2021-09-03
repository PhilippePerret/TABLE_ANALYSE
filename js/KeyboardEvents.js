window.onkeypress = function(e){

  switch(e.key){

    case 'l':
      UI.toggleLockStaves.call(UI)
      return stopEvent(e)

    case 'M':
      Manuel.toggle.call(Manuel);break

    case 'P':
      Preferences.toggle.call(Preferences);break

    case 'R':
      Record.toggle.call(Record);break

    case 'S':
      UI.toggleStaves();break;

    default:

      console.log("e.key = '%s'", e.key)
  }

}

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
