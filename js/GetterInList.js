'use strict'
/**
 * Class GetterInList
 * ------------------
 * Pour choisir facilement dans une liste
 * 
 * Version 1.1.0
 * -------------
 * 
 * @usage
 * 
 *    const gil = new GetterInList({
 *        items:[
 *          {name:"nom", value:'value', shortcut:'[modifier]lettre'}
 *        ]}
 *      , multiple: false/true
 *      , message: "le titre message"
 *      , onChooseMethod: <methode à appeler>)
 *      , newEnable: false/true // pour en créer un 
 *      , cancelEnable: Ajout d'un menu 'Renoncer'
 * 
 *    Et ensuite :
 * 
 *    gil.show({top:..., left:..., newEnable:...})
 * 
 * 

  # 1.1.0

    * Ajout de la possibilité d'utiliser des raccourcis clavier
    * 
  # 1.0.1
    Correction du bug sur le positionnement de la liste

  # 1.0.0
    Première version exploitable

 */


class GetterInList {
  
  constructor(data){
    this.data = data
    this.data.items || Object.assign(this.data, {items: data.values})
    this.build()
    this.observe()
  }

  show(params){
    // console.log("-> GetterInList.show(params)", params)
    params = params || {}
    if (params.top) this.obj.style.top = px(params.top)
    if (params.left) this.obj.style.left = px(params.left)
    var method = params.newEnable ? 'remove' : 'add'
    //console.log("method:", method)
    this.newItemField.classList[method]('hidden')
    var methodVisu = params.cancelEnable ? 'remove' : 'add'
    this.cancelItem.classList[methodVisu]('hidden')
    this.obj.classList.remove('hidden')
  }

  /**
   * Fermer le getter
   * 
   * Une des erreurs ici avait été de remettre les observeurs de 
   * touche sur la fenêtre (window.onkeypress et window.onkeyup). Le
   * problème est que cette méthode hide() peut arriver APRÈS qu'une
   * autre méthode a été appelée et a défini ses propres observeurs.
   * Ils seraient alors détruits et remplacés ici.
   * Donc il faut absolument remettre les anciens observeurs avant
   * l'appel de cette autre méthode.
   */
  hide(){
    console.log("-> GetterInList #hide")
    this.obj.classList.add('hidden')
  }

  /**
   * Méthode générale qui reçoit la valeur choisie dans la liste 
   * (+value+) et l'envoie à la méthode définie par le propriétaire 
   * pour la réception.
   * En plus, cette méthode remet les observeurs de touche de window
   * et ferme la liste
   */
  callChooseMethodWithValueAndHide(value){
    this.resetWindowObservers()
    this.data.onChooseMethod.call(null, value)
    this.hide()
  }

  resetWindowObservers(){
    console.log("-> GetterInList #resetWindowObservers")
    window.onkeypress = this.curOnKeyPress
    window.onkeyup    = this.curOnKeyUp
  }


  /**
   * Appelée quand on choisit une valeur
   * 
   * Le comportement est différent en fonction du fait qu'on peut en
   * choisir plusieurs ou une seule.
   * 
   */
  onClickItem(imenu, e){
    const value = this.data.items[imenu].value
    // Pour le moment, pas de traitement de plusieurs valeurs
    this.callChooseMethodWithValueAndHide(value)
    return stopEvent(e)
  }
  /**
   * Méthode appelée quand on presse Entrée sur le champ de nouvel 
   * item
   * 
   * Note : l'évènement est intercepté avant
   */
  onSetNew(){
    const value = this.newItemField.value.trim()
    this.callChooseMethodWithValueAndHide(value)
  }

  /**
   * Méthode appelée quand on clique sur une touche (hors du champ
   * de saisie d'un nouvel item)
   */
  onKeyPressForShortcuts(e){
    console.log("-> onKeyPressForShortcuts('%s')", e.key)
    console.log("this.shortcuts", this.shortcuts)
    if ( this.shortcuts[e.key] ){
      this.callChooseMethodWithValueAndHide(this.shortcuts[e.key])
    }
    return stopEvent(e)
  }
  /**
   * Méthode d'observation de la touche soulevée
   * pour savoir si l'utilisateur a pressé la touche
   * escape
   */
  onKeyUpForCancel(e){
    if ( e.key == 'Escape' ) {
      this.callChooseMethodWithValueAndHide(null)
      return stopEvent(e)
    }
  }

  /**
   * Pour actualiser la liste des items
   *
   */
  updateItems(newItems){
    this.data.items = newItems
    this.buildItems()
  }

  /**
   * Construction des items pour choix
   * 
   * La méthode définit aussi la relation entre le raccourci clavier
   * et l'item de menu, le cas échéant.
   * 
   */
  buildItems(menu){
    menu = menu || DGet('.getter_in_list', this.obj)
    menu.innerHTML = ''
    var imenu = 0
    this.shortcuts = {}
    const items = this.data.items
    items.push({name:'Renoncer',shortcut:'Escape', value:null})
    items.forEach(di => {
      var lab = di.name
      di.shortcut && (lab = `<span class="shortcut">${di.shortcut}</span> ${lab}`)
      const m = DCreate('LI', {index: imenu, text:lab, value:di.value||''})
      if ( di.shortcut ) {
        Object.assign(this.shortcuts, {[di.shortcut]: di.value})
      }
      menu.appendChild(m)
      listen(m, 'click', this.onClickItem.bind(this, imenu))
      // Pour pouvoir masquer l'item si cancelEnable n'est pas vrai
      if ( di.name == 'Renoncer' ) {
        this.cancelItem = m
      }
      ++ imenu
    })
  }

  build(){
    const menu = DCreate('UL', {class:'getter_in_list'})
    this.buildItems(menu)

    const c = DCreate('DIV', {class:'container_getter_in_list hidden'})
    c.appendChild(DCreate('H3', {text:this.data.message}))
    c.appendChild(menu)

    //
    // Un champ pour pouvoir créer un nouvel item
    // On le met toujours, mais il apparaitra ou pas suivant les
    // options
    //
    let ncss = ['gil_new_item']
    this.data.newEnable || ncss.push('hidden')
    const n = DCreate('INPUT', {type:'text', class:'gil_new_item', placeholder:"Nouvel item"})
    c.appendChild(n)

    document.body.appendChild(c)
    this.obj = c
  }

  observe(){
    const my = this
    // Note : les menus sont déjà surveillés
    $(this.obj).draggable()
    listen(this.newItemField,'keypress', e => {
      if ( e.key == 'Enter'){
        my.onSetNew.call(my)
        return stopEvent(e) // dans TOUS les cas
      }
    })
    console.log("Placement de l'observer de touches")
    // listen(this.obj, 'keypress', this.onKeyPressForShortcuts.bind(this))
    this.curOnKeyPress = window.onkeypress
    this.curOnKeyUp    = window.onkeyup
    window.onkeypress = this.onKeyPressForShortcuts.bind(this)
    window.onkeyup    = this.onKeyUpForCancel.bind(this)
  }

  get newItemField(){
    return this._newitemfield || (this._newitemfield = DGet('.gil_new_item', this.obj))
  }
}
