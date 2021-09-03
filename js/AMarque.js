'use strict';

/**
 * Les types de marques (modulation, emprunt, pédale, etc.)
 * Ils déterminent aussi leur type.
 * 
 */
const AMARQUES_TYPES = ['mod','emp','ped', 'cad']
const CADENCES = {
    'par': {name:'Cadence parfaite',   value:'par'}
  , 'imp': {name:'Cadence imparfaite', value:'imp'}
  , 'dem': {name:'Demi-cadence',       value:'dem'}
  , 'ita': {name:'Cadence italienne',  value:'ita'}
  , 'rom': {name:'Cadence rompue',     value:'rom'}
  , 'pla': {name:'Cadence plagale',    value:'pla'}
  , 'fau': {name:'Cadence fauréenne',  value:'fau'}
}

class AMarque extends AObjet {

  /**
   * Pour créer un nouvel objet à l'endroit du double-clic
   * 
   * @param {Event} e L'event double-click
   */
  static createNew(e){
    const newM = new AMarque({top: e.layerY - 30, left:e.layerX - 30, id:AObjet.items.length + 1})
    newM.isNew = true // pour la détruire si abandon
    newM.build_and_observe()
    Record.ON && Record.add(`amarque::create::[[${JSON.stringify(newM.data)}]]`)
    newM.toggleSelect(e)
    newM.edit()    
  }


  constructor(data){
    super(data)
    this.type = this.data.type = 'marque'
  }


  /**
   * Quand on clique sur la marque pour la (dé)sélectionner
   * 
   */
  toggleSelect(e){
    if (this.isSelected) {
      //
      // Déselectionner l'objet
      //
      this.deselect()
    } else {
      //
      // Sélectionner l'objet
      //
      this.select()
    }
    if (e) return stopEvent(e)
  }
  select(){
    this.obj.classList.add('selected')
    AObjet.setSelection(this)
    this.isSelected = true
  }
  deselect(){
    this.obj.classList.remove('selected')
    this.isSelected = false
  }

  /**
   * Quand on double clique sur l'élément => édition pour le moment
   * 
   */
  onDoubleClick(e){
    try{
      this.edit()
    } catch(err){
      console.error(err)
    }
    return stopEvent(e)// important
  }

  edit(){
    this.editor = this.editor || new Editeur(this)
    this.editor.value = this.content + (this.hasLigneProlongation ? '--' : '')
    this.editor.positionne({top:this.top, left:this.left})
    // Cf. la note sur la méthode 'positionne' de l'éditeur
    this.editor.show()
  }

  destroy(){
    this.obj.remove() // c'est tout ?
  }

  /**
   * Appelée par l'éditeur pour modifier la valeur
   * 
   * Note : des marques peuvent indiquer la nature de la nouvelle
   * valeur :
   * 
   *  '--' à la fin indique qu'il faut un trait de prolongation
   *  'mod:' au début indique que c'est une modulation
   *  'emp:' au début indique que c'est un emprunt
   *  'ped:'  ""  "" indique que c'est une pédale
   */
  setValue(newvalue){
    if ( newvalue === null) {

      //
      // L'édition a été annulée. Si c'est une création de note
      // alors elle doit être détruite.
      //
      if ( this.isNew ) {
        this.destroy()
      }

    } else {
      //
      // La valeur a été modifiée
      //
      var realvalue ; // la valeur qui sera affichée
      delete this._type
      if ( newvalue.endsWith('--') && newvalue.split(':')[0] != 'cad' ){
        newvalue = newvalue.substring(0, newvalue.length - 2)
        this.buildLigneProlongation()
      } else if (this.hasLigneProlongation && !newvalue.endsWith('--')) {
        this.destroyLigneProlongation()
      }

      let [pref, value] = newvalue.split(':')
      if ( value ) pref = pref.toLowerCase()
      else {
        value = pref
        pref  = null
      }

      if ( pref == 'cad') {
          // Pour une cadence, on ajoute un petit plus visible 
          // seulement à l'édition, pour ajouter les accords
          // précédents
          this.signePlusCad || this.buildSignePlusCadence()
      }

      // console.log("realvalue = '%s', newvalue = '%s', pref = '%s'", value = '%s', realvalue, newvalue, pref, value)
      if (pref) {
        this.type = pref
        realvalue = value
      } else {
        if ( newvalue.match(/^[IV]/) ){
          // console.log("'%s' est une harmonie", newvalue)
          this.type = 'har'
        }
      }



      Record.ON && Record.add(`amarque::set_value::${this.id}::${newvalue}`)

      this.content      = newvalue
      this.realContent  = realvalue || newvalue
      if ( this.type ) {
        this.obj.classList.add(this.type)
        this.setFontSizePerType()
      }
      this.isNew = false

      if ( pref && pref == 'cad' ) this.chooseCadenceType()

    }
  }


/**
 * Si le type de la marque est une cadence (markType = 'cad') alors
 * il faut choisir ce type
 * 
 */
chooseCadenceType(){
  // console.log("-> chooseCadenceType")
  this.getterCadenceType.show({top:this.top, left:this.left})
}
/**
 * Méthode qui reçoit le choix du type de la cadence.
 * Elle la consigne et l'affiche.
 * 
 */
onChooseTypeCadence(cadenceType){
  this.cadenceType = cadenceType
  // On marque la cadence
  this.marquerCadence()
  // On recorde la donnée
  Record.ON && Record.add(`amarque::set_cadence_type::${this.id}::${cadenceType}`)
}
get getterCadenceType(){
  return this._gettertypecad||(this._gettertypecad = this.buildGetterTypeCadence())
}
buildGetterTypeCadence(){
  var getter = new GetterInList({
    items:Object.values(CADENCES)
    , onChooseMethod: this.onChooseTypeCadence.bind(this)
    , message: "Type de la cadence"
  })
  return getter
}


  build_and_observe(){
    this.build()
    this.observe()
  }


  build(){
    var o = DCreate('DIV', {id:"marque", class:"amarque aobj"})
    this.contentSpan = DCreate('SPAN', {class:'content'})
    o.appendChild(this.contentSpan)
    UI.tableAnalyse.appendChild(o)
    o.style.left = px(this.left)
    o.style.top  = px(this.top)
    this.obj = o
    this.type && this.obj.classList.add(this.type)
    this.setFontSizePerType()
    this.content = 'c' // Do
  }


/**
 * Définir la taille de la police ne fonction du type
 * 
 */
setFontSizePerType(){
  this.contentSpan.style.fontSize = px((t => {
    const defaultSize = Pref.marque_accords_size
    switch(t){
      case 'ped':       return defaultSize * 0.5
      case 'har': case 'cad':  
        return Pref.marque_harmonie_size
    }
    return defaultSize
  }
  )(this.type))
}


  /**
   * TRAITEMENT SIGNE PLUS DE CADENCE
   * 
   */
  get hasSignePlusCadence(){return this.signePlusCad}
  buildSignePlusCadence(){
    this.signePlusCad = DCreate('BUTTON', {class:'plus_sign', text:'➕'})
    this.obj.appendChild(this.signePlusCad)
    listen(this.signePlusCad,'click',this.onClickSignePlusCadence.bind(this))
  }
  destroySignePlusCadence(){
    unlisten(this.signePlusCad,'click',this.onClickSignePlusCadence.bind(this))
    this.signePlusCad.remove()
    this.signePlusCad = null
    delete this.signePlusCad
  }


  get hasSigneMoinsCadence(){return this.signeMoinsCad }

  /**
   * Construction du bouton pour réduire la cadence
   * */
  buildSigneMoinsCadence(){
    this.signeMoinsCad = DCreate('BUTTON', {class:'moins_sign', text:'➖'})
    this.obj.appendChild(this.signeMoinsCad)
    listen(this.signeMoinsCad,'click',this.onClickSigneMoinsCadence.bind(this))
  }
  destroySigneMoinsCadence(){
    unlisten(this.signeMoinsCad,'click',this.onClickSigneMoinsCadence.bind(this))
    this.signeMoinsCad.remove()
    this.signeMoinsCad = null
    delete this.signeMoinsCad
  }


  /**
   * Quand on clique le signe "+" se trouvant dans une cadence,
   * on l'aggrandit jusqu'à l'accord précédent
   * 
   * Qu'est-ce qu'est un accord précédent ? C'est un objet qui est
   * avant (x <) et qui se trouve presque sur le même y (à 10 px
   * près)
   * 
   */
  onClickSignePlusCadence(e){

    var previousMark = null
    var prevCandidats = []
    
    for(var aobj of AObjet.items) {
      // console.log("Candidat pour la cadence : ", aobj)
      
      if ( aobj.isSysteme ) {
        // console.log("C'est un système, je le passe")
        continue
      }
      if (aobj.id == this.id){
        // console.log("C'est cet objet, je passe")
        continue
      }
      // TODO : en fait, il faudrait partir du "vrai" left (mais
      // c'est peut-être déjà le vrai left qui est utilisé)
      if (aobj.left > this.left){
        // console.log("Marque trop à gauche, je la passe", aobj)
        continue
      }
      if (aobj.top < this.top - 15){
        // console.log("Marque trop haute, je la passe", aobj)
        continue
      }
      if (aobj.top > this.top + 15){
        // console.log("Marque trop basse, je la passe", aobj)
      }
      prevCandidats.push(aobj)
    }
    if ( prevCandidats.length ) {
      if ( prevCandidats.length == 1 ) {
        previousMark = prevCandidats[0]
      } else {
        // On prend le candidat le plus proche de la cadence
        previousMark = prevCandidats.pop()
        prevCandidats.forEach(aobj => {
          if ( aobj.left > previousMark.left ) previousMark = aobj
        })
      }
      // console.log("Marque précédente trouvée : ", previousMark)
      const newLeft = previousMark.left - 20
      var diff = this.left - newLeft
      this.left = newLeft
      this.obj.style.width = px(diff + this.obj.offsetWidth)

      this.hasSigneMoinsCadence || this.buildSigneMoinsCadence()

    } else {
      erreur("Impossible de trouver une marque d'accord avant.<br/>Je ne peux pas rallonger la cadence.")
    }
    return stopEvent(e)
  }


  /**
   * Quand on clique sur le bouton "-" se trouvant dans une cadence
   * pour la raccoucir d'un accord.
   * 
   */
  onClickSigneMoinsCadence(e){

    //
    // Pour simplifier, on supprime tout, donc on redonne à 
    // cet objet sa taille initial
    // Il faut aussi supprimer le bouton
    var newWidth = 130 // la largeur normale
    var curWidth = this.obj.offsetWidth
    var newLeft = this.left + (curWidth - newWidth)
    this.left = newLeft
    this.obj.style.width = px(newWidth)
    this.destroySigneMoinsCadence()
    return stopEvent(e)
  }

  /**
   * Pour construire la marque de la cadence
   * 
   * Rappel : ce type est consigné dans this.cadenceType
   * 
   */ 
  marquerCadence(){
    let divMType = DGet('.mtype', this.obj)
    if ( !divMType ){
      divMType = DCreate('DIV', {class:'mtype'})
      this.obj.appendChild(divMType)
    }
    divMType.innerHTML = CADENCES[this.cadenceType].name
  }

  /**
   * TRAITEMENT LIGNE DE PROLONGATION
   * 
   */
  get hasLigneProlongation(){return this.prolongLine}
  buildLigneProlongation(){
    if ( ! this.prolongLine ) {
      this.prolongLine = DCreate('DIV', {class:'ligne_prolong'})
      this.handlerProlong = DCreate('DIV', {class:'handler_prolong'})
      this.obj.appendChild(this.prolongLine)
      this.obj.appendChild(this.handlerProlong)
      listen(this.handlerProlong, 'click',      this.onClickProlongHandler.bind(this))
      listen(this.handlerProlong, 'mousemove',  this.onMoveHandlerProlong.bind(this))
    }
  }
  onClickProlongHandler(e){
    if ( this.isHandlerProlongActivated ){
      this.desactiveHandlerProlongation(e)
    } else {
      this.activeHandlerProlongation(e)    
    }
    return stopEvent(e)
  }
  activeHandlerProlongation(e){
    this.isHandlerProlongActivated = true
    this.currentPLineWidth = this.prolongLine.offsetWidth + 30 // pour que la poignée se déplace bien
    this.prolongLine.style.width = px(this.currentPLineWidth)
    this.prolongLine.classList.add('activated')// pour les cadences
    this.handlerProlong.classList.add('activated')
    this.currentClientX = e.clientX
  }
  desactiveHandlerProlongation(){
    this.prolongLine.classList.remove('activated') // pour les cadences
    this.handlerProlong.classList.remove('activated')
    this.isHandlerProlongActivated = false
  }

  onMoveHandlerProlong(e){
    if (this.isHandlerProlongActivated){
      var diffx = e.clientX - this.currentClientX
      this.prolongLine.style.width = px(this.currentPLineWidth + diffx)
    }
    return stopEvent(e)
  }


  destroyLigneProlongation(){
    if (this.hasLigneProlongation){
      this.prolongLine.remove()
      $(this.obj).resizable("disabled")
    }
  }

  observe(){
    const my = this;
    listen(this.obj, 'click', this.toggleSelect.bind(this))
    listen(this.obj, 'dblclick', this.onDoubleClick.bind(this))
    // Draggable
    $(this.obj).draggable({
        rien:function(){}
      , drag:function(e, ui){
          if ( e.shiftKey ){ ui.position.top = my.top }
        }
      , stop:function(e,ui){
          my.left = ui.position.left
          my.top  = ui.position.top
        }
    })
  }

  get type(){return this._type}
  set type(t){
    this._type = t
    if (this.obj) {
      AMARQUES_TYPES.forEach(t => this.obj.classList.remove(t))
      this.obj.classList.add(this._type)
    }
  }

  get realContent(){return this.contentSpan.innerHTML}
  set realContent(v){this.contentSpan.innerHTML = v}

  // Le contenu complet, avec préfixe (aka type). Pour l'édition, par
  // exemple, il faut tout remettre
  get content(){return this._content}
  set content(v){
    // console.log("Je mets le contenu à '%s'", v)
    this._content = v
    this.contentSpan.innerHTML = v
  }
}
