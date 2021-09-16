'use strict'
/**
 * Class ReaderClass
 * -----------------
 * Pendant du Recorder, pour lire/afficher une analyse enregistrées
 * 
 */


class ReaderClass {

/**
 * = main =
 * Méthode principale (appelée par le bouton 'Lire') pour lire ou
 * afficher l'analyse voulue
 * 
 */
async read(){
  console.log("-> Reader.read")

  await Recorder.choosePrefix()
  this.prefix = Recorder.prefix

  console.log("Préfix de l'analyse à lire : ", this.prefix)

  //
  // Relecture et application des métadonnées
  //
  this.setMetadata()

  // 
  // Relecture et application des préférences
  // 
  this.setPreferences()

  //
  // Relecture et positionnement des systèmes
  //
  this.setSystemes()

  //
  // Relecture et positionnement des marques d'analyse
  //
  this.setAMarques()

}

/**
 * Méthode principale qui réécrit les marques d'analyse
 * 
 * Il y a deux cas :
 *  1)  la vitesse de lecture est à 100 : on place rapidement
 *      les marques
 *  2)  la vitesse est inférieure à 100 : on "joue" l'analyse en
 *      affichant progressivement les marques.
 * 
 */
setAMarques(){
  console.log("Relecture des marques d'analyse…")
  const marques = this.getAObjets()
  marques.forEach(dmark => this.drawAMarque(dmark))
  console.log("= Marques appliquées avec succès =")
}

/**
 * Lecture (création) de l'objet de données +data+
 * 
 */
drawAMarque(data){
  console.log("Je traite la lecture de l'objet : ", data)
  const o = new AMark(data)
  o.setValues(data)
  o.build_and_observe()
}

/**
 * Positionnement des systèmes
 * 
 */
setSystemes(){
  console.log("Positionnement des systèmes…")
  const systemes = this.getSystemes()
  systemes.forEach(dsys => this.setSysteme(dsys))
  console.log("= Systèmes positionnés =")
}
/**
 * Réglage du système
 * 
 **/
setSysteme(data){
  const o = DGet(`#systeme-${data.index}`)
  o && (o.style.top = px(data.top))
}

/**
 * Application des préférences (principalement pour la suite)
 * 
 */
setPreferences(){
  console.log("Application des préférences…")
  const prefs = this.getPreferences()
  var key ;
  PreferencesAppData.forEach(dp => {
    key   = `pref::${dp.id}` // clé pour le programme
    this.set(key, prefs[dp.id])
  })
  delete Preferences._data
  Preferences.init()
  console.log("= Préférences appliquées =")
}

setMetadata(){
  this.metadata = this.getMetadata()
  // TODO Le titre de la pièce par exemple
}

getPreferences(){return this.getter('preferences')}
getSystemes(){return this.getter('systemes')}
getAObjets(){return this.getter('aobjets')}
getMetadata(){return this.getter('metadata')}

getter(key){
  return JSON.parse(this.get(`${this.prefix}-${key}`))
}
get(key, defaut){return Recorder.get(key,defaut)}
set(key, value){return Recorder.set(key, value)}

  
}// /class ReaderClass
const Reader = new ReaderClass()
