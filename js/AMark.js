'use strict';



class AMarque extends AObjet {

  /**
   * Pour créer un nouvel objet à l'endroit du double-clic
   * 
   * La méthode fonctionne en deux temps :
   *  1) choix du type (type) de la marque (avec un GetterInList)
   *  2) contenu (value) de la marque (avec un Mini-éditeur)
   * 
   * @param {Event}   e L'event double-click
   * @param {String}  type    Le type de la marque. Défini seulement 
   *                          après son choix
   * @param {String}  value   Valeur textuelle de l'élément
   */
  static createNew(e, params){
    if ( undefined == params ) {
      const editor = new AMark_Editor({event:e, onReleaseMethod: this.createNew.bind(this, e)})
      return editor.proceed()

    } else if ( null === params ) {

      //
      // Annulation de l'utilisateur
      //
      return

    } else {

      //
      // Paramètres fournis, on peut construire la marque
      //

      // console.log("Je vais créer la marque avec les données : ", params)
      Object.assign(params, {id: AObjet.items.length + 1})
      const newMark = new AMarque(params)
      newMark.setValues(params)
      newMark.build_and_observe()
      newMark.toggleSelect(null)
    }
  }


constructor(data){
  super(data)
}


/**
 * Les données qui seront enregistrées
 * 
 */
get dataForRecord(){
  var dfr = super.dataForRecord
  Object.assign(dfr, {
      type:     this.type
    , subtype:  this.subtype
    , content:  this.content
    , prolong:  !!this.prolong
  })
  return dfr
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

/**
 * Édition de la marque
 * 
 * Noter qu'on ne peut pas changer le type de la marque. Pour faire
 * un autre type de marque, supprimer la marque et en refaire une
 * autre
 * 
 */
edit(){
  this.editor = this.editor || new Editeur(this)
  this.editor.value = this.content + (this.prolongLineBuilt ? '--' : '')
  this.editor.show({top:this.top, left:this.left}, AMARQUES_TYPES[this.type].message)
}

destroy(){
  this.obj.remove() // c'est tout ?
}

/**
 * Définition des valeurs à la création de la marque
 * Elles sont envoyées depuis la méthode AMarque.createNew()
 */
setValues(values){
  this.content  = values.content
  this.top      = values.top
  this.left     = values.left
  this.subtype  = values.subtype
  this.prolong  = values.prolong
  this.type     = values.type
}

/**
 * Redéfinition de la valeur de la marque d'analyse
 * 
 * Est appelée seulement par le mini-éditeur lorsque l'on veut 
 * modifier le texte de la marque.
 * Rappel : pour chager de marque (de type), il faut détruire la
 * marque actuelle et en créer une autre.
 * 
 *  '--' à la fin indique qu'il faut un trait de prolongation
 * 
 */
setValue(newvalue){
  const hasProlong = newvalue.endsWith('--')
  const content = hasProlong ? newvalue.substring(0, newvalue.length - 2) : newvalue

  /**
   * 
   * LIGNE DE PROLONGATION
   * À ajouter ou à retirer
   * 
   */
  if ( hasProlong && !this.isCadence ){
    this.buildLigneProlongation()
  } else if ( this.prolongLineBuilt && !hasProlong ) {
    this.destroyLigneProlongation()
  }

  /**
   * Petit "+" visible à l'édition pour allonger la cadence
   */
  if ( this.isCadence ) {
    this.signePlusCad || this.buildSignePlusCadence()
  }
}

get isCadence(){ return this.type == 'cad'}

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
  Record.ON && Record.add(`amark::set_cadence_type::${this.id}::${cadenceType}`)
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
    var css = ['amark', 'aobj']
    css.push(this.type)
    if (TYPES_PHILHARMONIEFONT.includes(this.type)) css.push('philharm')
    if ( this.subtype ) css.push(this.subtype) 
    console.log("css:", css)
    var o = DCreate('DIV', {id:this.domId, class:css.join(' ')})
    this.contentSpan = DCreate('SPAN', {class:'content', text:this.content})
    o.appendChild(this.contentSpan)
    UI.tableAnalyse.appendChild(o)
    o.style.left = px(this.left)
    o.style.top  = px(this.top)
    this.obj = o
    // S'il faut une ligne de prolongation, on la construit
    this.prolong && this.buildLigneProlongation()
    // S'il faut un "+" de cadence, on le construit
    this.isCadence && this.buildSignePlusCadence()
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
  get prolongLineBuilt(){return this.prolongLine}
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
    if (this.prolongLineBuilt){
      this.prolongLine.remove()
      $(this.obj).resizable("disabled")
    }
  }

  observe(){
    const my = this;
    listen(this.obj, 'click', this.toggleSelect.bind(this))
    listen(this.obj, 'dblclick', this.onDoubleClick.bind(this))
    if (['box','cir'].includes(this.type) ) {
      $(this.obj).resizable()
    }
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
    this.obj && this._type && this.obj.classList.remove(this._type)
    this._type = t
    this.obj && this.obj.classList.add(this._type)
  }

  // Le contenu complet, avec préfixe (aka type). Pour l'édition, par
  // exemple, il faut tout remettre
  get content(){return this._content}
  set content(v){
    this._content = v
    this.contentSpan && (this.contentSpan.innerHTML = v)
  }

  get domId(){return this._domid || (this._domid = `amark-${this.id}`)}
}
