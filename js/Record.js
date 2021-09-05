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

  get ON(){return this.isRecording === true}

  /**
   * Pour "basculer" l'enregistrement
   * 
   */
  toggle(){
    if (this.isRecording) this.stop()
    else this.save() // on sauve TODO lancer une boucle d'enregistrement
    // else this.start()
  }

  /**
   * Pour lancer l'enregistrement
   * 
   */
  start(){
    this.isRecording = true
    if ( this.prefix ) {
      this.setActif()
    } else {
      this.askForPrefix()
      this.ioperation = 0
    }
  }

  /**
   * Pour arrêter l'enregistrement
   * 
   */
  stop(){
    this.unsetActif()
    this.isRecording = false
  }

  /**
   * Enregistrement de l'écran actuel
   * 
   *  - On passe en revue tous les objets présents,
   *  - on les classe de gauche à droite et de haut en bas
   *  - on détruit les données actuelles
   *  - on les enregistre dans le stockage
   * 
   */
  save(){
    var eListe = []
    var key, io ;

    AObjet.items.forEach(e => {
      console.log("e:", e.data)
      if ( DGet(`#${e.domId}`) ) {
        console.log("L'objet #%s existe encore, avec les données", e.domId, e.dataForRecord)
        eListe.push(e.dataForRecord)
      } else {
        console.log("L'object n'existe plus")
      }
    })

    this.prefix = 'photo'

    //
    // Enregistrement des préférences
    //
    PreferencesAppData.forEach(dp => {
      key = `${this.prefix}-pref-${dp.id}`
      this.set(key, Pref[dp.id])
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
    return (a.top < (b.top - TOLERANCE_Y) || (nearY(a.top, b.top) && a.left < b.left)) ? 1 : -1
  }


  /**
   * Méthode qui fait le contraire d'enregistrer les opération, qui
   * les lit et, donc, reproduit les mêmes opération
   * 
   */
  read(prefix){
    var io, key ;

    prefix && (this.prefix = prefix )

    this.prefix = 'photo'

    if ( undefined == this.prefix ) return this.choosePrefix()
    
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
    for ( io = 0; io < nombreObjetsCourants ; ++ io) {
      key = `${this.prefix}-objet-${io}`
      this.dataObjets.push(JSON.parse(this.get(key)))
    }
    console.log("Tous les objets à lire :", this.dataObjets)

    // Vitesse en fonctionne des préférences
    // 100 doit donner 0 et 0 doit donner 5 secondes
    var speed = (100 - Pref.vitesse_relecture) / 20
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
      if ( dataObjet.type == 'systeme' ) {
        this.readSysteme(dataObjet)
      } else {
        this.readObjet(dataObjet)
      }
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
    console.log("Je traite la lecture du système : ", data)
    const o = DGet(`#${data.domId}`)
    console.log("Système top mis à %i ", data.top, o)
    o.style.top = px(data.top)
  }

  /**
   * On remet les préférences ajoutées
   * 
   **/
  readPreferences(){
    var keyr, key ;
    PreferencesAppData.forEach(dp => {
      keyr  = `${this.prefix}::${dp.id}` // clé pour l'enregistrement 
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
    var prefixes = this.stockage.getItem('prefixes') || ""
    prefixes = prefixes.split('::')
    prefixes.push(prefix)
    this.stockage.setItem('prefixes', prefixes.join('::'))
  }

  /**
   * Pour marquer que l'enregistrement est en cours 
   * (c'est une lumière rouge en haut à gauche)
   * 
   */
  setActif(){
    this.redLight || this.buildRedLight()
    this.faitClignoterRedLight()
  }
  unsetActif(){
    this.redLight.classList.add('hidden')
  }
  buildRedLight(){
    const o = DCreate('SPAN', {text:'🔴', style:'position:fixed;top:1em;left:1em;', class:'hidden'})
    document.body.appendChild(o)
    this.redLight = o
  }

  faitClignoterRedLight(){
    var itime = 0
    let redtimer = setInterval(() => {
      ++itime
      this.redLight.classList[itime % 2 == 1 ? 'add':'remove']('hidden')
      if (itime > 5){clearInterval(redtimer);redtimer = null}
    }, 300)
    this.redLight.classList.remove('hidden')
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
    const ed = this.editor
    ed.titre = "Préfixe (titre) de l'enregistrement"
    ed.setMethod = this.setPrefix.bind(this)
    ed.setFont('Arial', '16pt')
    ed.positionne({top:'4em', left:'15em', fixed:true})
    ed.value = "PRÉFIXE"
    ed.show()
  }
  setPrefix(prefix){
    this.prefix = prefix
    this.consignePrefix(prefix)
    this.recordPreferences()
    this.setActif() // On peut commencer
  }

  /**
   * Méthode permettant de choisir un préfixe déjà enregistré
   * 
   */
  choosePrefix(){
    const ed = this.editor
    ed.titre = "Préfixe de l'enregistrement à lire "
    ed.setFont('Arial', '16pt')
    ed.positionne({top:'4em', left:'15em', fixed:true})
    ed.setMethod = this.setPrefixToRead.bind(this)
    ed.value = "VALUE"
    ed.show()
  }
  setPrefixToRead(prefix){
    this.prefix = prefix 
    this.read(true)
  }


  get editor(){return this._editor || (this._editor = this.getEditor())}

  getEditor(){
    return new Editeur(this, {setMethod: null})
  }

}
const Record = new RecordClass()
