class UIClass {


  /**
   * Pour modifier un texte
   * 
   */
  editer(str){
    this.editeur.value = str
    return this.editeur.newValue;
  }

  get editeur(){
    return this._editor || (this._editor = new Editeur())
  }

  /**
   * Préparation de l'interface en début de session
   * 
   */
  setInterface(){
    // console.log("-> setInterface")

    Preferences.init()
        
    const hauteurFen  = window.innerHeight
    const moitieFen   = parseInt(hauteurFen / 2,10)
    this.panneauStave.style.height = px(moitieFen)

    this.panneauStave.onfocus = function(e){
      console.log("Focus dans l'iframe de Staves")
    }

    this.tableAnalyse.onfocus = (e) => {
      console.log("Focus dans table d'analyse")
      this.tableAnalyse.style.border = "2px solid blue"
    }
    this.tableAnalyse.focus()

    //
    // Écriture des systèmes (systèmes)
    //
    Systeme.drawAll()

    // Mettre la section content à la dimension
    //
    // Observation des éléments de l'interface
    //
    this.observe()

  }

  /**
   * Réglage de la hauteur de la section#content (qui contient 
   * l'analyse).
   * Note : cette méthode est appelée à la fin de la construction de
   * tous les systèmes et chaque fois que les éléments (systèmes) 
   * sont déplacés.
   */
  setTableAnalyseHeight(){
    this.tableAnalyse.style.height = px(Systeme.last.top + Systeme.last.height)
  }

  observe(){
    listen(window, 'dblclick', this.onDoubleClick.bind(this))
    listen(window, 'click',    this.onClickTableAnalyse.bind(this))
    // listen(this.tableAnalyse, 'click', (e)=>{/*console.log("Un clic sur la table d'analyse.")*/})

    listen(this.btnLockStaves, 'click', this.toggleLockStaves.bind(this))
    listen(this.btnRecording, 'click', this.toggleRecording.bind(this))
  }


  /**
   * Activer/désactiver l'enregistrement
   */
  toggleRecording(){
    Record.toggle()
    this.btnRecording.classList[Record.ON?'add':'remove']('pressed')
  }
  /**
   * Pour verrouiller et déverrouiller le déplacement des systèmes
   */
  toggleLockStaves(){
    this.stavesAreLocked = !this.stavesAreLocked
    this.btnLockStaves.classList[this.stavesAreLocked?'add':'remove']('pressed')
    Systeme[this.stavesAreLocked?'lockAll':'unlockAll'].call(Systeme)
  }

  onClickTableAnalyse(e){
    AObjet.deSelectAll.call(AObjet, e)
  }


  onDoubleClick(e){

    // On crée un nouvel élément
    AMark.createNew.call(AMark, e)

    return stopEvent(e)
  }


  /**
   * Méthode qui déplace tous les objets se situant en dessous de
   * +fromTop+ d'un montant de +dec+ pixels (+dec+ peut être négatif)
   * sauf l'objet d'identifiant +saufId+
   * 
   * Cette méthode est utilisée quand on déplace les systèmes
   */
  moveAllObjetUnder(fromTop, dec, saufId){
    console.log("Déplacer à partir de %i pour %i pixels", fromTop, dec)
    document.querySelectorAll('.aobj').forEach(obj => {
      console.log("Objet", obj, obj.offsetTop)
      if ( obj.offsetTop < fromTop || obj.id == saufId) return
      obj.style.top = px(obj.offsetTop + dec)
    })
  }

  /**
   * Méthode appelée quand on veut afficher/masquer Staves
   * 
   */
  toggleStaves(){
    if ( this.StavesON ){
      this.closeAndDesactiveStaves()
    } else {
      this.openAndActiveStaves() 
    }
    this.StavesON = !this.StavesON
  }
  /**
   * Ouvrir et activer l'application Staves pour faire des 
   * illustrations
   * 
   */
  openAndActiveStaves(){
    // console.log("-> UI.openAndActiveStaves")
    // this.panneauStave.contentWindow.postMessage({data:'HOUPS', name:'Table <-> Staves'}, '*')
    Duplex.openStaves()
  }

  closeAndDesactiveStaves(){
    this.panneauStave.classList.add('hidden') 
  }

  // Le picto pour verrouiller les systèmes
  get btnLockStaves(){return this._btnlockstaves || (this._btnlockstaves = DGet('footer #cb_staves_lock'))}
  // Le picto pour activer l'enregistrement
  get btnRecording(){return this._btnrecord || (this._btnrecord = DGet('footer img#cb_recording'))}

  get panneauStave(){
    return this._stavepanel || (this._stavepanel = DGet('iframe#staves2'))
  }
  get tableAnalyse(){
    return this._tableana || (this._tableana = DGet('body section#content'))
  }
}
const UI = new UIClass()
