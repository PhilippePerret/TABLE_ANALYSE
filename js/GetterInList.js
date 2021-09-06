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
 *      , newEnable: false/true // pour en créer un 
 * 
 *    Et ensuite :
 * 
 *    gil.show({top:..., left:..., newEnable:...})
 * 
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
    console.log("method:", method)
    this.newItemField.classList[method]('hidden')
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
  /**
   * Méthode appelée quand on presse Entrée sur le champ de nouvel 
   * item
   * 
   * Note : l'évènement est intercepté avant
   */
  onSetNew(){
    const value = this.newItemField.value.trim()
    this.data.onChooseMethod.call(null, value)
    this.hide()
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
   */
  buildItems(menu){
    menu = menu || DGet('.getter_in_list', this.obj)
    menu.innerHTML = ''
    var imenu = 0
    this.data.items.forEach(di => {
      const m = DCreate('LI', {index: imenu, text:di.name, value:di.value})
      menu.appendChild(m)
      listen(m, 'click', this.onClickItem.bind(this, imenu))
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
        return stopEvent(e)
      }
    })

  }

  get newItemField(){
    return this._newitemfield || (this._newitemfield = DGet('.gil_new_item', this.obj))
  }
}
