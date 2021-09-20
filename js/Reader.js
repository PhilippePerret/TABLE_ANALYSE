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
 * 
 * Méthode principale (appelée par le bouton 'Lire') pour lire ou
 * afficher l'analyse voulue
 * 
 */
async read(){
  console.log("-> Reader.read")

  await Recorder.choosePrefix()
  this.prefix = Recorder.prefix

  this.applyPreferences = confirm("Dois-je appliquer les préférences ?")

  //console.log("Préfix de l'analyse à lire : ", this.prefix)

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
  //console.log("Relecture des marques d'analyse…")
  AMark.cleanUp()
  this.marques = this.getAObjets()
  if ( Pref.vitesse_relecture == 100 ) {
    // console.log("Affichage instantanné des marques")
    this.marques.forEach(dmark => this.drawAMarque(dmark))
  } else {
    console.log("Affichage temporisé des marques")
    this.calcFrequenceLecture()
    this.afficheNextMarque()
  }
  // console.log("= Marques appliquées avec succès =")
}

/**
 * Calcul de la fréquence de lecture
 * 
 * Rappel : 0 = vitesse la plus lente, 99 = vitesse la plus élevée
 * 
 * 0  donnera 5000 (5 secondes entre chaque marque)
 * 99 donnera 50   (1 centième de secondes entre chaque marque)
 * 
 */
calcFrequenceLecture(){
   this.frequenceLecture = (100 - Pref.vitesse_relecture) * 50
}

/**
 * Affichage de la prochaine marque si elle existe
 * 
 */
afficheNextMarque(){
  if ( this.timerMarque ) {
    clearTimeout(this.timerMarque)
    this.timerMarque = null
  }
  const marque = this.marques.shift()
  if ( marque ) {
    this.drawAMarque(marque)
    this.timerMarque = setTimeout(this.afficheNextMarque.bind(this), this.frequenceLecture)
  } else {
    this.setFinLecture()
  }
}

setFinLecture(){
  console.log("Fin de la lecture")
}

/**
 * Lecture (création) de l'objet de données +data+
 * 
 */
drawAMarque(data){
  // console.log("Je traite la lecture de l'objet : ", data)
  const o = new AMark(data)
  o.setValues(data)
  o.build_and_observe()
  // TODO Scroller pour voir la marque
}

/**
 * Positionnement des systèmes
 * 
 */
setSystemes(){
  // console.log("Positionnement des systèmes…")
  const systemes = this.getSystemes()
  // console.log("Données enregistrées des systèmes : ", systemes)
  systemes.forEach(dsys => this.setSysteme(dsys))
  // console.log("= Systèmes positionnés =")
}
/**
 * Réglage du système
 * ------------------
 * On passe par les instances pour qu'elles soient rectifiées
 * 
 **/
setSysteme(data){
  //console.log("Positionnement de ", data)
  Systeme.getByIndex(data.index).positionne(data.top)
}

/**
 * Application des préférences (principalement pour la suite)
 * 
 */
setPreferences(){
  if ( this.applyPreferences ) {
    // console.log("Application des préférences…")
    const prefs = this.getPreferences()
    var key ;
    PreferencesAppData.forEach(dp => {
      key   = `pref::${dp.id}` // clé pour le programme
      this.set(key, prefs[dp.id])
    })
    delete Preferences._data
    Preferences.init()
    // console.log("= Préférences appliquées =")
  } else {
    // console.log("Les préférences ne sont pas appliquées.")
  }
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
