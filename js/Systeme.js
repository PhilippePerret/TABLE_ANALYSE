'use strict';
/**
  * Class Systeme
  * 
  * Gestion des images des systèmes de la partition
  * 
  */

class Systeme extends AObjet {

  static init(){
    this.all = []
  }

  /**
   * @return {Systeme} l'instance d'index +index+ (1-start)
   * 
   */
  static getByIndex(index){
    //console.log("this.all[index - 1] = ", this.all[index - 1], this.all)
    return this.all[index - 1]
  }

  /**
   * Pour dessiner tous les systèmes
   * 
   */
  static drawAll(){
    this.writeNextSystem(1)

  }

  static lockAll(){
    this.all.forEach(sys => sys.lock())
  }
  static unlockAll(){
    this.all.forEach(sys => sys.unlock())
  }

  /**
   * @return {Array} La liste des systèmes existants vraiment sur la
   * table d'analyse.
   * Note : le tout dernier, qui n'existe pas et qui a mis fin à 
   * l'écriture des systèmes n'est plus celui qui peut poser problème
   * puisqu'il a été retiré de this.all. Il s'agit plutôt de systèmes
   * qui, pour une raison ou une autre, serait supprimés de l'analyse
   *
   * Note : cette liste est recalculée chaque fois, il convient donc
   * de la mettre dans une variable si elle doit servir plusieurs
   * fois.
   * 
   */
  static get realAll(){
    var reals = []
    this.all.forEach(sys => { DGet(`#${sys.domId}`) && reals.push(sys)})
    return reals
  }

  static writeNextSystem(isysteme, currentTop){
    const my = this
    my.all || my.init()
    AObjet.items || AObjet.init()
    currentTop = currentTop || Pref.top_first_system
    const sys = new Systeme({id:AObjet.items.length + 1, top:currentTop, index:isysteme /*, width: Pref.systeme_width */})
    my.all.push(sys)
    sys.tryToBuild()
      .then( _ => my.writeNextSystem(++isysteme, (sys.top + sys.height + Pref.distance_systemes)))
      .catch(err => {
        err && console.error(err)/* normal à la fin */
        // On doit détruire la dernière instance
        var lastNonSystem = my.all.pop()
        lastNonSystem = null
        // Le (vrai) dernier système (on le consigne pour modifier la
        // hauteur de la table d'analyse)
        my.last = my.all[my.all.length - 1]
        my.last.isLast = true
        UI.toggleLockStaves.call(UI)
        UI.setTableAnalyseHeight.call(UI)
      })
  }

  /**
   * Instanciation du système
   * ------------------------
   * À la base, un système est caractérisé par une image, un numéro
   * et une hauteur
   * 
   */
  constructor(data){
    super(data)
    this.index  = data.index
    this.type   = 'systeme'
    this.data.type = 'systeme'
  }


  /**
   * Les données qui seront enregistrées
   * 
   */
  get dataForRecord(){
    var dfr = super.dataForRecord
    return dfr
  }

  get domId(){return this._domid || (this._domid = `systeme-${this.index}`)}
  get isSysteme(){return true}
  
  /**
   * Construction du système (mais il peut ne pas exister)
   * 
   */
  tryToBuild(){
    const my = this
    return new Promise((ok,ko) => {
      my.obj = this.buildAndSetImage()
      listen(my.obj, 'error', e => ko(null))
      listen(my.obj, 'load', e => {my.writeAndObserve();ok()})
    })
  }
  writeAndObserve(){
    UI.tableAnalyse.appendChild(this.obj)
    this.observe()
    // this.mesure()
  }

  buildAndSetImage(){
    let img = DCreate('IMG', {id: this.domId})
    img.src = `systemes/systeme-${this.index}.jpg`
    img.draggable = false // supprimer ghost-image quand on move
    img.className = 'aobj systeme' // aobj = objet d'analyse
    img.style.top   = px(this.top)
    img.style.width = px(Pref.systeme_width)
    return img
  }

  /**
   * Pour repositionner le système (par exemple après une lecture)
   * 
   */
  positionne(top){
    this.top = this.data.top = top
    this.obj.style.top = px(top)
  }

  /**
   * Observation du système
   * 
   * */
  observe(){
    listen(this.obj, 'click',     this.toggleMoving.bind(this))
    listen(this.obj, 'mousemove', this.onMove.bind(this))
  }

  lock(){
    this.isLocked = true
  }
  unlock(){
    this.isLocked = false
  }

  /**
   * Méthode-bascule pour passer du mode fixe au mode déplacement.
   * En mode déplacement, l'objet suit la souris
   * 
   */
  toggleMoving(e){
    if ( this.isLocked ) return stopEvent(e)
    if ( this.moving ) {
      // 
      // <= On était en déplacement
      // => on doit fixer à la nouvelle position
      // 
      const initTop = this.top
      this.top = e.clientY - this.rectTop
      this.obj.classList.remove('selected')
      const dataMoveAll = {top:initTop, offset:this.top - initTop, sauf:this.id}
      AObjet.moveAllUnder(dataMoveAll)

    } else {
      
      // 
      // <= On était fixé
      // => on doit se mettre à se déplacer
      // 
      this.rectTop = e.clientY - this.top
      this.obj.classList.add('selected')    
    }
    this.moving = !this.moving
  }

  onMove(e){
    if ( !this.moving ) return stopEvent(e)
    this.obj.style.top = px(e.clientY - this.rectTop)
  }


  // MÉTHODE DE CONTRÔLE
  // Méthode pour vérifier la hauteur du système (on place un trait
  // pour voir)
  mesure(){
    const div = DCreate('DIV', {style:'position:absolute;left:calc(100%/2);width:8px;background-color:#5F5;'})
    UI.tableAnalyse.appendChild(div)
    div.style.top     = px(this.top)
    div.style.height  = px(this.height)
  }

}// class Systeme
