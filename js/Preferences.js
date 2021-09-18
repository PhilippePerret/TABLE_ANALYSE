'use strict';
/*

  Version 1.3.1
  -------------

# 1.3.1
  - Amélioration de la gestion de la récupération des préférences
    au lancement de l'application.
    
# 1.3.0
  
  - Mise automatique des valeurs dans Pref grâce à l'ajout de la 
  propriété 'type' qui définit le type de la valeur de la pref, entre
  'number', 'boolean', 'float' et 'string'
  - Ajout de la méthode setPrefExactValues() pour mettre automatique-
  ment les valeurs dans Pref

# 1.2.0
  
  Mise des valeurs par défaut dans les données des préférences de
  l'application, ce qui semble tout de même le plus logique.

# 1.1.0
  
  Isolation complète du module, avec la méthode de définition des
  valeur par défaut dans le module propre à l'application.

*/

class PreferencesClass {

init(){
  this.data // pour l'instancier
  this.insertStylesInHead()
}

/**
 * Méthode qui met dans Pref toutes les valeurs avec leur bon type.
 * Par exemple, s'il existe la propriété maLongeur, de typeV 'float'
 * alors Pref.maLongueur sera égale à cette valeur exacte (donc un
 * flottant)
 * 
 * Les valeurs non typées ne sont pas traitées (régression).
 * 
 */
setPrefExactValues(){
  if ( 'undefined' == typeof Pref ) return
  PreferencesAppData.forEach(dp => this.setPrefExactValue(dp.id, dp.typeV))
}

setPrefExactValue(key, typeV){
  typeV || (typeV = this.appPrefData[key].typeV)
  var stringValue, exactValue ;
  if ( typeV ) {
    stringValue = this.data[key]
    switch(typeV){
      case 'number':
        exactValue = Number(stringValue); break
      case 'float':
        exactValue = parseFloat(stringValue); break
      case 'boolean':
        exactValue = stringValue == '1'
      case 'string':
        exactValue = stringValue; break
      default: 
        exactValue = stringValue
    }
    Object.assign(Pref, {[key]: exactValue})
  }
}

toggle(){
  this.isOpened ? this.hide() : this.open()
}
// Pour ouvrir le panneau
open(){
  if ( storageAvailable('localStorage') ){
    this.obj ? this.show() : this.build()
    this.isOpened = true
  } else {
    alert("Malheureusement, on ne peut pas utiliser le stockage local…")
  }
}
hide(){
  this.obj.classList.add('hidden')
  this.isOpened = false
}
show(){
  this.obj.classList.remove('hidden')
}

/**
 * Méthode qui applique les préférences dans l'interface
 * 
 * Fonctionnement
 * --------------
 * On écrit une balise STYLE dans le dom, à la fin du HEAD (donc 
 * après toutes les définitions) où vont être reprises toutes les
 * valeurs en les affectant aux classes (selectors) adéquats.
 * Par exemple, la préférence 'marque_accords_size' définit la taille
 * des marques d'accord dans l'application Table d'analyse. Donc, on
 * met dans cette balise style :
 *    div.aobj.acc {font-size: <size>px;}
 * 
 * Dès qu'une préférence de ce type (on les reconnait au fait 
 * qu'elles définisssent la propriété 'selector') est modifiée, on 
 * actualise cette balise style.
 */
insertStylesInHead(){
  const my = this
  if ( this.stylesTagInHead ) {
    this.updateStylesInHead()
  } else {
    this.stylesTagInHead = DCreate('STYLE',{type:'text/css', text: this.buildSelectorsInHead()})
    document.head.appendChild(this.stylesTagInHead)
  }
}
/**
 * Méthode pour actualiser les préférences dans les selectors de
 * head
 */
updateStylesInHead(){
  this.stylesTagInHead.innerHTML = this.buildSelectorsInHead()
}
buildSelectorsInHead(){
  const my = this
  var selectors = []
  PreferencesAppData.forEach(dp => {
    if ( undefined == dp.selector ) return ;
    selectors.push(`${dp.selector} {${dp.selector_value.replace(/__VALUE__/g, my.data[dp.id])}}`)
  })
  return selectors.join("\n")  
}


get data(){return this._data || this.getData()}

// Construction du panneau
build(){
  var o = DCreate('SECTION', {id:'preferences-panel'})
  o.appendChild(DCreate('DIV', {id:'tip-close', text:"(⇧ P pour fermer)"}))
  o.appendChild(DCreate('H2',{text:'Préférences'}))

  // Pour simplifier l'écriture
  const DA = this.data

  if ( 'undefined' == typeof PreferencesAppData) {
    erreur("Il faut définir la constante 'PreferencesAppData' définissant les données de préférences")
  } else {
    PreferencesAppData.forEach( dp => {
      if ( dp.type == 'inputtext'){
        o.appendChild(this.buildInputText(dp))
      } else if ( dp.type == 'checkbox' ) {
        o.appendChild(this.buildCheckBox(dp))
      } else if ( dp.type == 'pressoir' ) {
        o.appendChild(this.buildChoixPressoirs(dp))
      }
    })
  }

  document.body.appendChild(o)

  this.obj = o
  this.observe()
}

observe(){
  $(this.obj).draggable()
  listen(this.obj, 'dblclick', e => {return stopEvent(e)})
}
 
saveData(key, val){
  if ( 'function' == typeof val ) val = val.call()
  if ( undefined == val) {
    erreur("La préférence '"+key+"' n'a pas de valeur définie…")
  } else {
    this.data[key] = val
    localStorage.setItem(`pref::${key}`, val)
    this.setPrefExactValue(key)
    if ( this.appPrefData[key].selector ) { this.updateStylesInHead() }
  }
}

getData(){
  // On commence par essayer de relever les données qui sont peut-être
  // enregistrées
  let data = {}
  PreferencesAppData.forEach(dpref => {
    var val = this.getValueInStorage(dpref.id)
    if ( val ) {
      //console.log("%s est défini, de type %s et de valeur %s", dpref.id, dpref.typeV, val)
      switch(dpref.typeV){
        case 'number': case 'float': val = Number(val); break;
      }
      Object.assign(data, {[dpref.id]: val})
    }
  })
  //console.log("Data préférences récupérées :", data)
  this._data = this.defaultize(data)
  return this._data
}

/**
 * @return {String} la valeur de la clé +key+ dans le stockage
 * local.
 *
 * @param {String} key  La clé de préférence (sans le 'pref::')
 * 
 */
getValueInStorage(key){
  return localStorage.getItem(`pref::${key}`)
}

/**
 * On met les valeurs pas défaut aux valeurs non définies
 * 
 * +data+ correspond aux données qui sont relevées dans le stockage
 * local.
 * 
 * On en profite pour faire la table appPrefData qui contient en clé
 * l'identifiant de la préférence et en valeur sa donnée complète 
 * (sauf la valeur)
 */
defaultize(data){
  this.appPrefData = {}
  PreferencesAppData.forEach(dp => {
    Object.assign(this.appPrefData, {[dp.id]: dp})
    if ( undefined == data[dp.id] ) Object.assign(data, {[dp.id]: dp.default})
  })
  return data
}

/**
 * Construction d'un checkbox pour le panneau de préférences
 * 
 */
buildCheckBox(params){
  const d = DCreate('DIV', {class:'div-checkbox div-data'})

  // La case à cocher    
  const cb = DCreate('INPUT',{type:'checkbox', id: params.id, value:params.value})
  d.appendChild(cb)
  // Pour sauver la donnée
  cb.addEventListener('click', this.saveData.bind(this, params.id, function(e){const checked = cb.checked ? '1' : '0'; console.log(params.id + ' enregistré à ' + checked ); return checked}))

  cb.checked = this.data[params.id] == '1'

  // Le label
  const lab = DCreate('LABEL', {for:params.id, text: params.label})
  d.appendChild(lab)

  // La description (if any)
  if (params.description){
    const dd = DCreate('DIV', {class:'description', text:params.description})
    d.appendChild(dd)
  };

  return d

}

/**
 * Construction d'un pressoir à valeurs pour le panneau des préférences
 * 
 */
buildChoixPressoirs(params){
  const my = this
  const div = DCreate('DIV', {id:`div-${params.id}`, class:'type-valeur div-data'})
  const lab = DCreate('LABEL', {text:params.label})
  div.appendChild(lab)
  const val = Number(this.data[params.id]||0) 
  const btn = DCreate('BUTTON', {id:params.id, text: params.values[val]})
  btn.setAttribute('data-index', val)
  div.appendChild(btn)
  btn.addEventListener('click', function(e){
    let curIdx = Number(btn.getAttribute('data-index'))
    curIdx = (curIdx + 1) % params.values.length
    btn.innerHTML = params.values[curIdx]
    btn.setAttribute('data-index', curIdx)
    my.saveData(params.id, curIdx)
  })
  // La description (if any)
  if (params.description){
    div.appendChild(DCreate('DIV', {class:'description', text:params.description}))
  };

  return div
}
/**
 * Construction d'un pressoir à valeurs pour le panneau des préférences
 * 
 * L'identifiant doit toujours être construit avec le nom :
 * 
 *    default-<nom de la propriété Preferences>
 * 
 * Par exemple, si la propriété est 'snap_width' (qu'on obtient dans
 * le programme par 'Preferences.snap_width') alors l'identifiant ici
 * doit être "default-snap_width"
 * 
 */
buildInputText(params){
  const my = this
  const prop = params.id.split('-')[1]
  const div = DCreate('DIV', {id:`div-${params.id}`, class:'type-valeur div-data'})
  const lab = DCreate('LABEL', {text:params.label})
  div.appendChild(lab)
  const field = DCreate('INPUT', {type:'text', id:params.id, value: params.value || this.data[params.id]})
  div.appendChild(field)
  field.addEventListener('change', function(e){my.saveData(params.id, field.value)})
  // La description (if any)
  if (params.description){
    div.appendChild(DCreate('DIV', {class:'description', text:params.description}))
  };

  return div
}

}//PreferencesClass
const Preferences = new PreferencesClass()
// Si on veut utiliser 'Pref[<key>]' on peut ajouter à la fin de
// Preferences_AppData.js :
//    const Pref = Preferences.data
// Note : ne pas le mettre ici, car le fichier Preferences_AppData.js
// n'est pas encore chargé et ça plantera.




/**
 * Méthodes DOM utiles
 * 
 */

function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}
