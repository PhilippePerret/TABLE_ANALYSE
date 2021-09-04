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
   * Pour ajouter l'opération op (alias de 'save')
   */
  add(op){
    return // coupe circuit
    return this.save(op)
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
    // Nombre d'objets enregistrées pour ce préfixe et nombre
    // d'objets à sauver
    //
    const nombreObjetsSaved = this.get(`${this.prefix}-nombre-objets-saved`, 0)
    const nombreObjectCourants = eListe.length

    //
    // Classement des objets
    //
    eListe.sort(this.objetSorting.bind(this))

    //
    // Enregistrement des objets
    //
    for (var io = 0; io < nombreObjectCourants; ++ io) {
      this.set(`${this.prefix}-objet-${io}`, JSON.stringify(eListe[io]))
    }

    //
    // Destruction des objets qui "dépassent" (if any)
    // 
    if ( nombreObjetsSaved > nombreObjectCourants ) {
      // TODO
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
   * Opérations
   * ----------
   *  Déplacement d'un système
   *        'systeme::move::<index système>::<nouveau top>' 
   *  Replacement de tous les systèmes sous 
   *        'systeme::move_all_under::<id système>::<data déplacement>' // cf. Systeme.toggleMoving
   *  Création d'une marque d'analyse
   *        'amark::create::[[<données>]]'
   *  Enregistrement du contenu d'une marque d'analyse
   *        'amark::set_value::<id amark>::[[<nouvelle valeur>]]'
   * 
   */
  read(prefix){
    if ( undefined == prefix ) return this.choosePrefix()
    this.nombreOperations = Number(this.get(`${this.prefix}-nombre_operations`))
    this.iope = 0 ;
    this.readTimer = setInterval(this.readNextOperation.bind(this), 1 * 1000)
    this.readNextOperation() // la première tout de suite  
  }
  readNextOperation(){
    ++ this.iope
    if ( this.iope > this.nombreOperations) {
      clearInterval(this.readTimer)
      this.readTimer = null
    } else {
      var key = `${this.prefix}-operation-${this.iope}`
      var ope = this.get(key)
      console.log("Opération '%s' : ", key, ope)
      this.traiteOperation(ope)
    }
  }

  traiteOperation(ope){
    const dope      = ope.split('::')
    const firstKey  = dope.shift()
    const action    = dope.shift()
    switch(firstKey){
      case 'pref':
        // => Réglage d'une préférence
        return this.actionOnPreference(action,dope)
      case 'systeme':
        // => réglage d'un système
        return this.actionOnSysteme(action, dope)
      case 'amark':
        // => réglage d'une marque d'analyse
        return this.actionOnAMarque(action, dope)
    }
  }

  actionOnPreference(action, dope){

  }
  actionOnSysteme(action, dope){
    console.log("-> actionOnSysteme('%s', '%s')", action, dope)
    const index   = dope.shift() // le plus fréquemment
    const systeme = Systeme.all[Number(index) - 1]
    const value   = dope.shift() // le plus fréquemment
    switch(action){
      case 'move':
        console.log("Je dois déplacer le système à %i", Number(value), systeme)
        systeme.top = Number(value)
        break
      case 'move_all_under':
        AObjet.moveAllUnder(JSON.parse(value))
        break
    }
  }
  actionOnAMarque(action, dope){

  }


  /**
   * Pour enregistrer les préférences actuelles
   * 
   */
  recordPreferences(){
    Object.keys(Preferences.data).forEach(key => {
      this.save(`pref::${key}::${Pref[key]}`)
    })
  }
  /**
   * Pour enregistrer un changement en cours d'analyse
   * 
   */
  preference(k, v){
    this.save(`pref::${k}::${v}`)
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
