'use strict'
/**
 * Class GetterInList
 * ------------------
 * Pour choisir facilement dans une liste
 * 
 * Version 1.0.1
 * -------------
 * 
 * @usage
 * 
 *    const gil = new GetterInList({
 *        items:[
 *          {name:"nom", value:'value'}
 *        ]}
 *      , multiple: false/true
 *      , message: "le titre message"
 *      , onChooseMethod: <methode à appeler>)
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
    if (params && params.top) this.obj.style.top = px(params.top)
    if (params && params.left) this.obj.style.left = px(params.left)
    this.obj.classList.remove('hidden')
  }
  hide(){
    this.obj.classList.add('hidden')
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
    this.data.onChooseMethod.call(null, value)
    this.hide()
    return stopEvent(e)
  }

  build(){
    const menu = DCreate('UL', {class:'getter_in_list'})
    var imenu = 0
    this.data.items.forEach(di => {
      const m = DCreate('LI', {index: imenu, text:di.name, value:di.value})
      menu.appendChild(m)
      listen(m, 'click', this.onClickItem.bind(this, imenu))
      ++ imenu
    })

    const c = DCreate('DIV', {class:'container_getter_in_list hidden'})
    c.appendChild(DCreate('H3', {text:this.data.message}))
    c.appendChild(menu)
    document.body.appendChild(c)
    this.obj = c
  }

  observe(){
    // Note : les menus sont déjà surveillés
    $(this.obj).draggable()
  }
}
