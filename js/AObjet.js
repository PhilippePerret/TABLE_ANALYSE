'use strict';
/**
 * 
 * Classe AObjet
 * -------------
 * Pour donner la constante AObjets qui est la liste de tous les
 * objets d'analyse
 * 
 * Classe de tous les objets d'analyse
 * 
 */

class AObjet {

  static add(objet){
    this.items.push(objet)
  }

  static init(){
    this.items = []
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

/**
 * Quand la préférence "Ajuster les marques de même type" est activée
 * l'application doit checker chaque ajustement de position pour
 * mettre l'élément en place.
 * 
 */
static checkPositionAndAdjust(amark){
  return new Promise((ok,ko) => {
    for (var aobj of this.items){
      if ( aobj.type != amark.type ) continue ;
      if ( Math.abs(aobj.top - amark.top) > 30 ) continue ;
      // Sinon, on ajuste
      amark.fixeTop(aobj.top)
    }
  })
}

// ===============================================================

  constructor(data){
    this.data   = data
    this._id    = data.id
    this._top   = data.top
    this._left  = data.left
    AObjet.add(this)
  }

  get dataForRecord(){
    var dfr = {}
    if ( this.obj ) {
      Object.assign(dfr, {
          domId:  this.domId
        , width:  this.obj.offsetWidth
        , height: this.obj.offsetHeight
        , top:    this.obj.offsetTop
        , left:   this.obj.offsetLeft
        , type:   this.type
      })
    }
    return dfr // on ajoute le reste dans chaque sous classe
  }

  destroy(){
    this.obj.remove()
    this.destroyed = true
  }

  get id(){return this._id}
  set id(v){this._id = v}

  get height(){return this._height || (this._height = this.obj && this.obj.offsetHeight)}
  set height(v){this._height = v}
  get top(){return this._top || (this._top = this.obj.offsetTop)}
  set top(v){this._top = v; this.obj && (this.obj.style.top = px(v))}

  get bottom(){ return this.top + this.height }

  get left(){return this._left || (this._left = this.obj.offsetLeft)}
  set left(v){this._left = v; this.obj && (this.obj.style.left = px(v))}
}
