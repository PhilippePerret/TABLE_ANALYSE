'use strict';

const TOLERANCE_Y = 20 ;

/**
 * Méthode qui retourne TRUE quand les nombres y1 et y2, représentant
 * des offsetTop, sont à moins de TOLERANCE_Y, donc sont considérés
 * comme proches
 */
function nearY(y1, y2){
  return Math.abs(y2, y1) < TOLERANCE_Y
}

class RecordClass {

  /**
   * Enregistrement de l'écran actuel
   * 
   *  - On passe en revue tous les objets présents,
   *  - on les classe de gauche à droite et de haut en bas
   *  - on détruit les données actuelles
   *  - on les enregistre dans le stockage
   * 
   */
  async save(){
    var eListe = []
    var key, io ;

    AObjet.items.forEach(e => {
      console.log("e:", e.data)
      if ( DGet(`#${e.domId}`) ) {
        console.log("L'objet #%s existe encore, avec les données", e.domId, e.dataForRecord)
        eListe.push(e.dataForRecord)
      } else {
        console.log("L'objet n'existe plus")
      }
    })

    await this.askForPrefix();

    console.log("Préfixe pour l'enregistrement : ", this.prefix)

    //
    // Enregistrement des préférences
    //
    PreferencesAppData.forEach(dp => {
      key = `${this.prefix}-pref-${dp.id}`
      this.set(key, Preferences.data[dp.id])
    })

    // 
    // Nombre d'objets enregistrées pour ce préfixe et nombre
    // d'objets à sauver
    //
    const nombreObjetsSaved = this.get(`${this.prefix}-nombre-objets-saved`, 0)
    const nombreObjetsCourants = eListe.length

    //
    // Classement des objets
    //
    eListe.sort(this.objetSorting.bind(this))

    //
    // Enregistrement des objets
    //
    for (io = 0; io < nombreObjetsCourants; ++ io) {
      this.set(`${this.prefix}-objet-${io}`, JSON.stringify(eListe[io]))
    }

    // 
    // Enregistrement du nombre d'objets
    // 
    this.set(`${this.prefix}-nombre_objets`, nombreObjetsCourants)

    //
    // Destruction des objets qui "dépassent" (if any)
    // 
    if ( nombreObjetsSaved > nombreObjetsCourants ) {
      for (io = nombreObjetsCourants; io < nombreObjetsSaved; ++ io){
        key = `${this.prefix}-objet-${io}`
        this.remove(key)
      }
    }

  }

  /**
   * Méthode de classement des objets
   * 
   * De gauche à droite et de haut en bas
   */
  objetSorting(a, b){
    return (a.top < (b.top - TOLERANCE_Y) || (nearY(a.top, b.top) && a.left < b.left)) ? -1 : 1
  }


  /**
   * Méthode qui fait le contraire d'enregistrer les opération, qui
   * les lit et, donc, reproduit les mêmes opération
   * 
   */
  async read(){
    var io, key ;

    await this.choosePrefix()

    // 
    // Relecture et application des préférences
    // 
    this.readPreferences()
    
    //
    // Nombre d'objets
    //
    const nombreObjetsCourants = Number(this.get(`${this.prefix}-nombre_objets`))
    console.log("Nombre d'objets à lire", nombreObjetsCourants)

    //
    // Boucle pour récupérer chaque objet
    //
    this.dataObjets = [] // pour mettre les données de tous les objets 
    var dataSystemes = []
    for ( io = 0; io < nombreObjetsCourants ; ++ io) {
      key = `${this.prefix}-objet-${io}`
      var dobj = JSON.parse(this.get(key))
      if ( dobj.type == 'systeme' ) {
        dataSystemes.push(dobj)
      } else {
        this.dataObjets.push(dobj)
      }
    }
    console.log("Tous les objets à lire :", this.dataObjets)

    //
    // Placement de tous les systèmes
    //
    var dsys ;
    while ( dsys = dataSystemes.pop() ){ this.readSysteme(dsys) }

    // Vitesse en fonctionne des préférences
    // 100 doit donner 0 et 0 doit donner 5 secondes
    var speed = (100 - Pref.vitesse_relecture) / 20
    console.log("Vitesse de lecture en préférences : ", Pref.vitesse_relecture)
    console.log("speed lecture", speed)
    this.readTimer = setInterval(this.readNextObjet.bind(this), speed * 1000)
    this.readNextObjet() // le premier tout de suite  
  }

  readNextObjet(){
    var dataObjet = this.dataObjets.shift()
    if ( dataObjet ) {
      //
      // ON traite cet objet
      //
      this.readObjet(dataObjet)
    } else {
      //
      // Tous les objets ont été traités
      // 
      clearInterval(this.readTimer)
      this.readTimer = null
    }
  }

  /**
   * Lecture (création) de l'objet de données +data+
   * 
   */
  readObjet(data){
    console.log("Je traite la lecture de l'objet : ", data)
    const o = new AMark(data)
    o.setValues(data)
    o.build_and_observe()
  }

  /**
   * Lecture des systèmes enregistrés
   * Ça consiste simplement à les positionner, car contrairement
   * à la lecture d'objets, les systèmes sont placés au chargement
   * de la page.
   * 
   **/
  readSysteme(data){
    const o = DGet(`#${data.domId}`)
    o.style.top = px(data.top)
  }

  /**
   * On remet les préférences ajoutées
   * 
   **/
  readPreferences(){
    var keyr, key ;
    PreferencesAppData.forEach(dp => {
      keyr  = `${this.prefix}-pref-${dp.id}` // clé pour l'enregistrement 
      key   = `pref::${dp.id}` // clé pour le programme
      this.set(key, this.get(keyr))
    })
    delete Preferences._data
    Preferences.init()
  }


  /**
   * Pour l'enregistrement des préfixes
   * 
   */
  consignePrefix(prefix){
    var prefixes = this.getPrefixes()
    if ( prefixes.includes(prefix) ) return ;
    prefixes.push(prefix)
    this.stockage.setItem('prefixes', prefixes.join('::'))
  }

  /**
   * Pour marquer que l'enregistrement est en cours 
   * (c'est une lumière rouge en haut à gauche)
   * 
   */
  setActif(){
  }
  unsetActif(){
    this.redLight.classList.add('hidden')
  }


  /**
   * Méthode principale d'enregistrement et de lecture dans l'espace
   * de stockage
   * 
   */
  get(key, defaut){ return this.stockage.getItem(key) || defaut }
  set(key,value){this.stockage.setItem(key,value)}
  remove(key){this.stockage.removeItem(key)}


  get stockage(){
    return this._stockage || (this._stockage = localStorage)
  }
  get prefix(){ return this._prefix || (this._prefix = this.askForPrefix())}
  set prefix(v){this._prefix = v}


  /**
   * Méthode demandant le préfixe (le nom) de l'enregistrement
   * 
   */
  askForPrefix(){
    return new Promise((ok,ko) => {
      this.getterPrefix || this.buildGetterPrefix()
      this.getterPrefix.data.onChooseMethod = this.setPrefix.bind(this, ok)
      this.getterPrefix.show({top:'4em', left:'15em', fixed:true, newEnable:true})
    })
  }
  /**
   * Méthode de retour du choix du préfixe
   */
  setPrefix(ok, prefix){
    this.prefix = prefix
    this.consignePrefix(prefix)
    ok()
  }

  /**
   * Méthode permettant de choisir un préfixe déjà enregistré
   * 
   */
  choosePrefix(){
    return new Promise((ok,ko) => {
      this.getterPrefix || this.buildGetterPrefix()
      this.getterPrefix.updateItems(this.getPrefixesAsItems())
      this.getterPrefix.data.onChooseMethod = this.setPrefixToRead.bind(this, ok)
      this.getterPrefix.show({newEnable:false})
    })
  }
  /**
   * Méthode qui reçoit le préfix choisi pour la lecture
   */
  setPrefixToRead(ok, prefix){
    this.prefix = prefix 
    ok()
  }

  buildGetterPrefix(){
    const prefixes = this.getPrefixesAsItems()
    this.getterPrefix = new GetterInList({
        items: prefixes
      , message: "Enregistrement à utiliser"
      , onChooseMethod: this.setPrefixToRead.bind(this)
    }) 
  }

  /**
   * Retourne la liste {Array} des préfixes pour GetterInList
   * 
   */
  getPrefixesAsItems(){
    let prefixes = this.getPrefixes()
    return prefixes.map(p => {return {name:p, value:p}})
  }
  /**
   * Retourne la liste {Array} de tous les préfixes enregistrés
   * 
   */
  getPrefixes(){
    let pfs = this.get('prefixes')
    if ( ! pfs ) return [] 
    else return pfs.split('::')
  }


  get editor(){return this._editor || (this._editor = this.getEditor())}

  getEditor(){
    return new Editeur(this, {setMethod: null})
  }

}
const Record = new RecordClass()
