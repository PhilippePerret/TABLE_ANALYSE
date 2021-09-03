'use strict'
/**
 * Class Message
 * --------------
 * Pour l'affichage des messages à l'écran
 * 
 * 
 *    message(str)      Une simple note
 *    erreur(str)       Un message d'erreur
 *    action(str)       Une action en cours
 * 
 */


function message(str){
  Message.showMessage.call(Message, str)
  return true
}
function error(err){
  Message.showError.call(Message, err)
  return false
}
function erreur(err){return error(err)}

function action(str){
  Message.showAction.call(Message, str)
}

class MessageClass {

  init(){
    this.build()
    listen(this.panneauMessage, 'click', this.hideMessage.bind(this))
  }

  showMessage(msg){ this.showText(msg, 'notice') }
  showError(err){   this.showText(err, 'error') }
  showAction(msg){  this.showText(msg, 'doaction') }

  showText(str,type){
    this.clearTimerMessage()
    this.divContent.innerHTML = str
    this.panneauMessage.className = type
    this.panneauMessage.classList.remove('hidden')
    if ( type !== 'error') this.msgTimer = setTimeout(this.hideMessage.bind(this),20*1000)
  }

  hideMessage(){
    this.panneauMessage.innerHTML = ""
    this.panneauMessage.classList.add('hidden')
    this.clearTimerMessage()
  }
  clearTimerMessage(){
    if ( this.msgTimer ){
      clearTimeout(this.msgTimer)
      this.msgTimer = null
    }
  }

  /**
   * Construction de la boite qui contiendra tous les messages
   * 
   */
  build(){
    const closeBox = DCreate('SPAN', {class:'close-btn', text:'⌧'})
    this.divContent  = DCreate('DIV', {class:'message-content'})
    const o = DCreate('DIV', {id:'message', class:'hidden', inner: [this.divContent, closeBox]})
    document.body.appendChild(o)
    this._msgpanel = o
  }

  get panneauMessage(){ return this._msgpanel }

}
const Message = new MessageClass()
