'use strict';
/**
 * AMark_Editor
 * ------------
 * 
 * L'édition d'une "marque d'analyse" (AMark) étant assez complexe,
 * on se sert de cette classe pour créer ou éditer les marques.
 * 
 * Une marque est caractérisée par :
 *    - son type 
 *    - son sous-type (éventuellement)
 *    - son texte (le plus souvent)
 */


/**
 * Les TYPES DE CADENCES
 * 
 */
const CADENCES = {
    'par': {name:'Cadence parfaite',   value:'par', autocontent:'I'}
  , 'imp': {name:'Cadence imparfaite', value:'imp', autocontent:'I'}
  , 'dem': {name:'Demi-cadence',       value:'dem', autocontent:'V'}
  , 'ita': {name:'Cadence italienne',  value:'ita', autocontent:'I'}
  , 'rom': {name:'Cadence rompue',     value:'rom', autocontent:'VI'}
  , 'pla': {name:'Cadence plagale',    value:'pla', autocontent:'I'}
  , 'fau': {name:'Cadence fauréenne',  value:'fau', autocontent:'I'}
}

const TYPES_NOTES = {
    'np': {name:'Note de passage',  value:'np', autocontent:'NP'}
  , 're': {name:'Retard',           value:'re', autocontent:'R'}
  , 'br': {name:'Broderie',         value:'br', autocontent:'BR'}
  , 'db': {name:'Double-broderie',  value:'db', autocontent:'DBR'}
  , 'in': {name:'Note naturelle',   value:'in', autocontent:'NN'}
  , 'an': {name:'Anacrouse',        value:'an', autocontent:'ANA'}
}

/**
 * Les types de marques (modulation, emprunt, pédale, etc.)
 * Ils déterminent la propriété 'type' de la marque.
 * 
 * Les champs qui n'ont pas de valeur 'default', ne possède pas de
 * propriété :content.
 * 
 */
const AMARQUES_TYPES = {
    'acc': {name:'Accord',        ajustX:12,  ajustY:8,     value:'acc', default:'c', message:"Nom de l'accord"}
  , 'har': {name:'Harmonie',      ajustX:16,  ajustY:8,     value:'har', default:'I', message:"Chiffrage"}
  , 'mod': {name:'Modulation',    ajustX:24,  ajustY:-80,   value:'mod', default:'c', message:"Nouvelle tonalité"}
  , 'emp': {name:'Emprunt',       ajustX:4,   ajustY:-60,   value:'emp', default:'c', message:"Tonalité de l'emprunt"}
  , 'cad': {name:'Cadence…',      ajustX:-70, ajustY:14,    value:'cad', subtype:true, autocontent:true}
  , 'ped': {name:'Pédale',        ajustX:20,  ajustY:10,    value:'ped', default:'1', message:"Degré de la pédale"}
  , 'txt': {name:'Texte',         ajustX:0,   ajustY:23,    value:'txt', subtype:true, default:'',  message:"Texte à afficher"}
  , 'seg': {name:'Segment',       value:'seg', subtype:true, default:'membre 1', message:"Légende (vide si aucune)"}
  , 'not': {name:'Type de note…', value:'not', subtype:true, autocontent:true}
  , 'cir': {name:'Cercle',        value:'cir'}
  , 'box': {name:'cadre',         value:'box'}
}

// Liste des types (ci-dessus) qui doivent utiliser la 
// fonte PhilHarmonieFont
const TYPES_PHILHARMONIEFONT = ['acc','har','mod','emp','cad','ped']

class AMark_Editor {

constructor(data){
  this.data   = data
  this.event  = data.event

  /* Pour écrire toutes les coordonnées
  var xy = {}
  for(var k in this.event){
    if ( k.endsWith('X') || k.endsWith('Y')) Object.assign(xy, {[k]: this.event[k]})
  }
  console.log("Coordonnées du click ", xy)
  //*/

}

/**
 * = main =
 * 
 * Méthode qui procède à l'édition. On repasse toujours par cette
 * function, jusqu'à ce que toutes les valeurs nécessaires soient
 * définies. 
 * 
 */
proceed(){
  // console.log("-> proceed() / amark_data = ", this.amark_data)
  if ( !this.amark_type ) return this.getAMarkType()
  if ( this.isRequiringSubType && !this.amark_subtype) return this.getAMarkSubType()
  if ( this.isRequiringContent && undefined == this.amark_content) return this.getAMarkContent()
  this.hasAutoContent && this.setAutoContent()
  this.finishWith(this.amark_data)
}

/**
 * Pour finir, on envoie les données à la méthode qui les attend
 * pour construire ou reconstruire l'objet.
 * 
 * En cas d'annulation, +data+ est null
 * 
 */
finishWith(data){
  this.data.onReleaseMethod.call(null, data)
}

/**
 * Les DATA de la Marque d'analyse
 * 
 */
get amark_data(){
  return {
      type:     this.amark_type
    , prolong:  !!this.hasProlong
    , subtype:  this.amark_subtype
    , content:  this.amark_content
    , top:      this.position.top   + this.rectifTopPerType
    , left:     this.position.left  + this.rectifLeftPerType
  }
}

get amark_type(){return this._amark_type}
get amark_subtype(){return this._amark_subtype}
get amark_content(){return this._amark_content}

/**
 * Rectification du left et du top par rapport au clic de souris
 * en fonction du type de marque
 */
get rectifLeftPerType(){
  return this.dataOfType.ajustX || 0
}
get rectifTopPerType(){
  return this.dataOfType.ajustY || 0
}

/**
 * Les méthodes pour obtenir les valeurs des données
 * 
 */

/**
 * Méthode pour obtenir le type de la marque
 */
getAMarkType(){
  this.getterOfAMarkType.show(this.position)
  this._datatype      = null
  this._gettersubtype = null
  this._editorcontent = null
}
onChooseType(type){
  this._amark_type = type
  this.proceed()
}
/**
 * Méthode pour obtenir le sous-type de la marque
 * (si nécessaire)
 */
getAMarkSubType(){
  this.getterOfAMarkSubtype.show(this.position)
}
onChooseSubtype(subtype){
  this._amark_subtype = subtype
  this.proceed()
}

/**
 * Méthode pour obtenir le contenu textuel de l amark
 */
getAMarkContent(){
  this.editorOfAMarkContent.value = this.amark_content || this.defaultValue
  this.editorOfAMarkContent.show(this.position)
}
onSetContent(content){
  this.hasProlong = content.endsWith('--')
  this._amark_content = this.hasProlong 
    ? content.substring(0, content.length - 2) 
    : content
  // On met toujours une prolongation à une pédale, même lorsqu'elle
  // n'est pas indiquée
  if ( this.amark_type == 'ped' ) this.hasProlong = true
  this.proceed()
}

/**
 * Méthode qui règle le contenu automatique pour les valeurs
 * qui le nécessite. Par exemple pour les cadences.
 * 
 */
setAutoContent(){
  switch(this.amark_type){
    case 'cad':
      this._amark_content = CADENCES[this.amark_subtype].autocontent
      break
    case 'not':
      this._amark_content = TYPES_NOTES[this.amark_subtype].autocontent
      break
    default:
      erreur("Impossible de définir l'autocontent du type '"+this.amark_type+"'…")
  }
}

/**
 * 
 * Méthode d'état, pour savoir si la marque a besoin de telle ou 
 * telle chose (subtype, content)
 * 
 */
get isRequiringSubType(){
  return undefined != this.dataOfType.subtype
}
get isRequiringContent(){
  return undefined != this.dataOfType.default
}
get hasAutoContent(){
  return this.dataOfType.autocontent == true
}


// --- PRIVATE ---

// La position des différents "éditeur" (getters de liste, 
// mini-éditeur)
get position(){
  // return this._pos || (this._pos = {top:this.event.layerY, left:this.event.layerX})
  return this._pos || (this._pos = {top:this.event.pageY - 40, left:this.event.pageX - 40})
}

// La valeur par défaut, en fonction du type
get defaultValue(){
  return this.dataOfType.default
}

// Les données du type (dans AMARQUES_TYPES)
get dataOfType(){
  return this._datatype || ( this._datatype = AMARQUES_TYPES[this.amark_type])
}

/**
 * 
 * Les éditeurs particuliers
 * 
 */

// Éditeur pour obtenir le type
get getterOfAMarkType(){
  return this._gettertype || (this._gettertype = new GetterInList(this.paramsGetterOfType))
}

// Éditeur pour obtenir le sous-type (subtype)
get getterOfAMarkSubtype(){
  return this._gettersubtype || (this._gettersubtype = new GetterInList(this.paramsGetterOfSubtype))
}

// Éditeur pour obtenir le contenu textuel
get editorOfAMarkContent(){
  return this._editorcontent || (this._editorcontent = new Editeur(this, {message:this.dataOfType.message, setMethod: this.onSetContent.bind(this)}) )
}


/**
 * 
 * Les paramètres pour les éditeurs particuliers (getter de liste…)
 * 
 */
get paramsGetterOfType(){
  return {
      values:         Object.values(AMARQUES_TYPES)
    , message:        "Type de la marque"
    , onChooseMethod: this.onChooseType.bind(this)
  }
}

// Paramètres pour le getter de sous-type
get paramsGetterOfSubtype(){
  var d = {}
  switch(this.amark_type){
    case 'cad':
      d = {
          values: Object.values(CADENCES)
        , message:"Type de la cadences"
      }
      break
    case 'not':
      d = {
          values: Object.values(TYPES_NOTES)
        , message:"Type de la note :"
      }
      break
    case 'txt':
      d = {
          values: [{name:"Gros", value:'size1'}, {name:"Moyen", value:'size2'}, {name:"Petit", value:'size3'}]
        , message:"Taille du texte"
      }
      break
    case 'seg':
      d = {
          values:[{name:'À plat sur la portée', value:'h-up'}, {name:'À plat sous la portée', value:'h-down'}, {name:'Droit à gauche', value:'v-left'}, {name:'Droit à droite', value:'v-right'}]
        , message:"Disposition du segment"
      }
      break
    default:
      erreur("Le type '"+this.amark_type+"' ne définit pas son sous-type…")
      return null
  }
  return Object.assign(d, {onChooseMethod: this.onChooseSubtype.bind(this)})
}

} // AMark_Editor
