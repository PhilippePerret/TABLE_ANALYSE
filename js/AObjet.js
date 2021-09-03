'use strict';
/**
 * 
 * Classe AObjet
 * -------------------
 * Pour donner la constante AObjets qui est la liste de tous les
 * objets d'analyse
 * 
 * Classe de tous les objets d'analyse
 * 
 */

class AObjet {

  static add(objet){
    this.items || (this.items = [])
    this.items.push(objet)
  }

  /**
   * 
   * Pour détruire la sélection courante
   * 
   */
  static removeCurrentSelection(){
    if ( this.selection && this.selection.length ) {
      let aobj = this.selection[this.selectionPointer]
      // console.log("Détruire :", aobj)
      if (confirm("Veux-tu vraiment détruire cette marque ?")){
        this.remove(aobj)
        this.selection.splice(this.selectionPointer, 1)
        -- this.selectionPointer;
      }
    }
  }

  static remove(aobjet){
    var newItems = []
    this.items.forEach(aobj => {
      if ( aobj.id == aobjet.id ) return
      else newItems.push(aobj)
    })
    this.items = newItems
    aobjet.destroy()
    Record.ON && Record.save(`destroy-aobjet-${aobjet.id}`)
  }



  static setSelection(aobjet){
    this.deSelectAll()
    this.selection = [aobjet]
    this.selectionPointer = 0
  }

  static deSelectAll(e){
    if ( this.selection ) {
      this.selection.forEach(aobj => aobj.deselect())
    }
    this.selection = []
    e && stopEvent(e)
  }

  /**
   * Pour déplacer tous les objets d'analyse d'un certain nombre
   * de pixels à partir d'une certaine hauteur.
   * 
   * @param {Hash} params les paramètres de déplacement :
   *    .top      À partir de cette hauteur
   *    .offset   Pour ce nombre de pixels
   *    .sauf     Sauf l'objet avec cet identifiant (c'est lui qui
   *              occasionne le déplacement)
   * 
   */
  static moveAllUnder(params){
    this.items.forEach(obj => {
      if ( obj.top < params.top || obj.id == params.sauf) return ;
      obj.top = obj.top + params.offset
    })
    UI.setTableAnalyseHeight.call(UI)
  }

  constructor(data){
    this.data   = data
    this._id    = data.id
    this._top   = data.top
    this._left  = data.left
    AObjet.add(this)
  }

  destroy(){
    this.obj.remove()
    this.destroyed = true
  }

  get id(){return this._id}
  set id(v){this._id = v}

  get height(){return this._height || (this._height = this.obj.offsetHeight)}
  get top(){return this._top || (this._top = this.obj.offsetTop)}
  set top(v){this._top = v; this.obj.style.top = px(v)}

  get left(){return this._left || (this._left = this.obj.offsetLeft)}
  set left(v){this._left = v; this.obj.style.left = px(v)}
}
