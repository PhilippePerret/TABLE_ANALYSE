'use strict';
/**
 * 
 * Recorder
 * ========
 * Le "recorder" permet d'enregistrer la table d'analyse, d'en faire
 * une photographie.
 * 
 * Puisque l'application Table D'analyse est statique, les données
 * sont enregistrées dans le stockage local. On doit pouvoir obtenir
 * le code enregistré et l'enregistrer dans un fichier pour le 
 * remettre plus tard (la difficulté actuelle étant qu'il faut garder
 * les images des systèmes)
 * 
 * La nouvelle version de septembre 2021 enregistre :
 *  - toutes les métas données dans une seule donnée
 *  - toutes les positions de système dans une seule donnée
 *  - tous les objets dans une seule donnée
 *  - toutes les préférences dans une autre donnée
 * On obtient donc :
 *    <prefixe>-metadata
 *    <prefixe>-systemes
 *    <prefixe>-aobjets
 *    <prefixe>-preferences
 * 
 * L'enregistrement est produit pour pouvoir faire une lecture tempo-
 * risée de l'analyse. 
 * Pour ce faire, il faut être capable de savoir à quel système 
 * appartient quel objet. On utilise les règles suivantes :
 *  - une harmonie appartient toujours au système supérieur
 *  - un accord appartient toujours au système inférieur. SAUF lors-
 *    qu'il est "dans" le système
 *  - une pédale appartient toujours au système supérieur. SAUF lors-
 *    qu'il est "dans" le système
 *  - une cadence appartient toujours au système supérieur.
 *  - une module ou un emprunt appartiennent toujours au système in-
 *    férieur
 *  - tous les autres objets appartiennent au système le plus proche.
 * 
 */


/**
 * La tolérance pour considérer que deux objets sont à la même hauteur
 * 
 */
const TOLERANCE_Y = 20 ;

/**
 * Méthode qui retourne TRUE quand les nombres y1 et y2, représentant
 * des offsetTop, sont à moins de TOLERANCE_Y, donc sont considérés
 * comme proches
 */
function nearY(y1, y2){
  return Math.abs(y2, y1) < TOLERANCE_Y
}

class RecorderClass {

  /**
   * Enregistrement de l'écran actuel
   * 
   *  - On passe en revue tous les objets présents,
   *  - on les classe de gauche à droite et de haut en bas
   *  - on détruit les données actuelles
   *  - on les enregistre dans le stockage
   * 
   * Note : l'asynchronicité ne sert que pour demander le préfix à
   * utiliser (un nouveau ou un ancien)
   * 
   */
  async save(){

    await this.askForPrefix();
    console.log("Préfixe pour l'enregistrement : ", this.prefix)

    this.saveMetadata()
    this.savePreferences()
    this.saveSystemes()
    this.saveObjets()

  }

  saveMetadata(){
    console.log("Enregistrement des métadonnées…")
    var tbl = {
        date: String(new Date())
      , prefix: this.prefix
    }
    this.set(`${this.prefix}-metadata`, JSON.stringify(tbl))
    console.log("= Métadonnées enregistrées =")
  }

  savePreferences(){
    console.log("Enregistrement des préférences…")
    var tbl = {}
    PreferencesAppData.forEach(dp => {
      Object.assign(tbl, {[dp.id]: Preferences.data[dp.id]})
    })
    this.set(`${this.prefix}-preferences`, JSON.stringify(tbl))
    console.log("= Préférences enregistrées =")
  }

  saveSystemes(){
    console.log("Enregistrement des systèmes…")
    //
    // On doit produire une table (liste) contenant :
    //  - les systèmes classés, leur top et leur bottom
    this.systemes = Systeme.all.map(sys => {
      return {index: sys.index, top:sys.top, bottom:sys.bottom, aobjets:[]}
    })
    this.set(`${this.prefix}-systemes`, JSON.stringify(this.systemes))
    console.log("= Systèmes enregistrés =")
  }

  /**
   * Enregistrement des objets
   * -------------------------
   * C'est la méthode la plus complexe puisqu'elle doit associer dans
   * un premier temps les objets à leur système et ensuite les
   * classer.
   * 
   */
  saveObjets(){
    console.log("Enregistrement des objets…")

    //
    // Association des objets aux systèmes
    //
    this.associerObjetsEtSystemes()

    // La liste qui va contenir tous les objets
    oListe = []

    //
    // On boucle sur chaque système (ils sont dans l'ordre)
    //
    this.systemes.forEach(dsys => {
      // Classement des objets (de gauche à droite)
      dsys.aobjets.sort(this.objetSorting.bind(this))
      // On les ajoute
      dsys.aobjets.forEach(aobj => oListe.push(aobj.dataForRecord))
    })

    //
    // Enregistrement des objets
    //
    this.set(`${this.prefix}-aobjets`, JSON.stringify(oListe))

    console.log("= Objets enregistrés =")
  }

  /**
   * Méthode permettant d'associer les objets aux systèmes. ON
   * met les objets dans this.systemes (propriété objets)
   * 
   */
  associerObjetsEtSystemes(){
    AObjet.items.forEach(aobj => {
      // On ne traite pas les systèmes
      if ( aobj.isSysteme ) return ;
      // On ne traite pas les objets supprimés
      if ( ! DGet(`#${aobj.domId}`) ) return ; 
      console.log("Traiter l'objet :", aobj.dataForRecord)

      const leSysteme = getSystemeAssocieA(aobj)

      //
      // On associe la marque au système
      //
      leSysteme.aobjets.push(aobj)
    
    })
  }

  /**
   * @return {Hash} Les données du système associé à la marque
   * +aobj+
   * 
   */
  getSystemeAssocieA(aobj) {
    // 
    // On cherche le système avant et le système après
    //
    var [sysAuDessus, sysEnDessous] = this.getSystemAvantEtApres(aobj.top, aobj.bottom)
    //
    // En fonction du type de l'élément, on prend un
    // système ou l'autre
    //
    var leSysteme = null
    switch(aobj.type){
      // Les types qui sont toujours au-dessus
      case 'acc': case 'mod': case 'emp': return sysEnDessous
      // Les types qui sont toujours en dessous
      case 'har': case 'ped': case 'cad': return sysAuDessus
      // Les autres types => on prend le système le plus près
      default:
        // SI le haut de la marque est au-dessus du bas du système
        // supérieur, elle est forcément associée à ce système 
        // supérieur
        if (aobj.top < sysAuDessus.bottom) return sysAuDessus ;
        // SINON, SI le bas de la marque est en dessous du haut du
        // système inférieur, la marque est forcément associée à ce
        // système inférieur
        else if ( aobj.bottom > sysEnDessous.top ) return sysEnDessous ;
        // SINON, SI la distance entre le haut de la marque et le
        // bas du système supérieur est plus petite que la distance
        // entre le bas de l'objet et le haut du système inférieur,
        // alors la marque est associée au système supérieur
        else if ( aobj.top - sysAuDessus.bottom < sysEnDessous.top - aobj.bottom){
          return sysAuDessus
        } 
        // Dans tous les autres cas, la marque est associé au 
        // système inférieur.
        else return sysEnDessous ;
    }// switch aobjet.type
  }

  /**
   * Cherche et retourne [système avant, système après] les valeurs
   * pour +top+ et +bottom+
   */
  getSystemAvantEtApres(top, bottom){
    var sysAuDessus, sysEnDessous ;
    this.systemesCount || (this.systemesCount = this.systemes.length)
    for(var isys = 0; isys < this.systemesCount; ++isys){
      var sys = this.systemes[isys]
      if ( sys.bottom < top) {
        sysAuDessus = sys
      }
      // La fin
      if ( sys.top > bottom ) {
        sysEnDessous = sys
        break
      }
    }
    return [sysAuDessus, sysEnDessous]
  }


  /**
   * Méthode de classement des objets
   * --------------------------------
   * Cette méthode doit permettre d'avoir une liste classée des 
   * objets. Mais elle fonctionne de façon simple maintenant que les
   * objets sont associés à leur système. Il suffit de les vérifier
   * de gauche à droite
   */
  objetSorting(a, b){
    return a.left < b.left ? -1 : 1
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
const Recorder = new RecorderClass()
