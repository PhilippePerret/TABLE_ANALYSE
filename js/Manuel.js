'use strict'
/**
 * Manuel
 * ------
 * version 1.0.0
 * 
 * Pour afficher le manuel de l'application.
 * 
 * 
 # 1.0.0
    Version complète avec affichage des raccourcis-clavier
    
 # 0.1.0
    Première version utilisable
 */


class ManuelClass {
  toggle(){
    this[this.isOpened ? 'close' : 'open']()
    this.isOpened = !this.isOpened
  }  
  open(){
    this.obj || this.build()
    this.obj.classList.remove('hidden')
  }
  close(){
    this.obj.classList.add('hidden')
  }

   build(){
  
    this.buildShortcutPanel()

    const o = DCreate('SECTION', {id:"manuel", class:'hidden'})
    o.appendChild(DCreate('DIV', {id:'tip-close', style:"float:right;", text:"(⇧M pour fermer)"}))

    const cont = DCreate('DIV', {id:'contenu_manuel', class:'content'})
   

    //
    // La section des raccourcis clavier (if any)
    //
    if ( this.shortcutsSection ) {
      cont.appendChild(DCreate('BUTTON', {id:'btn_shortcuts', style:"float:right;", text:"Raccourcis clavier"}))
      o.appendChild(this.shortcutsSection)
    }

    cont.appendChild(DCreate('H2', {text:"Manuel d'utilisation"}))

    if ('undefined' == typeof ManuelData ) {
      alert("Il faut définir les données du manuel dans une constante ManuelData")
    } else {
      // On peut construire le manuel
      var ioperation = 0
      ManuelData.forEach(md => {
        const op = new ManuelItem(Object.assign(md, {index: ++ioperation}))
        cont.appendChild(op.build())
      })
    }
    o.appendChild(cont)

    //
    // On ajoute tout ça au DOM
    //
    document.body.appendChild(o)
    this.obj = o
    this.observe()
  }


  /**
   * Construction du panneau des raccourcis, s'ils sont définis
   * 
   * L'application doit définir la constante ManuelShortcutsData
   */
  buildShortcutPanel(){
    if ('undefined' == typeof ManuelShortcutsData) return;

    const o = DCreate('SECTION', {id:'manuel_shortcuts', class:'hidden'})
    o.appendChild(DCreate('BUTTON', {id:'btn_manuel', style:"float:right;", text:"Manuel"}))
    o.appendChild(DCreate('H2', {text:"Liste des raccourcis"}))
    const tbl = DCreate('TABLE', {id:'table_shortcuts'})
    o.appendChild(tbl)
    var ishortcut = 0
    ManuelShortcutsData.forEach(msd => {
      const shc = new ManuelShortcut(Object.assign(msd, {index:++ishortcut}))
      tbl.appendChild(shc.build())
    })
    this.shortcutsSection = o
  }

  observe(){
    const btnShortcuts  = DGet('#btn_shortcuts', this.obj)
    const btnManuel     = DGet('#btn_manuel', this.obj)
    listen(btnShortcuts,  'click', this.toggleShortcutsPanel.bind(this))
    listen(btnManuel,     'click', this.toggleShortcutsPanel.bind(this))
  }

  toggleShortcutsPanel(){
    if ( this.isShortcutPanelDisplayed ) {
      this.shortcutsSection.classList.add('hidden')
      this.manualContent.classList.remove('hidden')
    } else {
      this.shortcutsSection.classList.remove('hidden')
      this.manualContent.classList.add('hidden')
    }
    this.isShortcutPanelDisplayed = !this.isShortcutPanelDisplayed
  }


  get manualContent(){return this._manualcont || (this._manualcont = DGet('#contenu_manuel', this.obj))}
}
const Manuel = new ManuelClass()


class ManuelItem {
  constructor(data){
    this.index     = data.index
    this.operation = data.operation
    this.procedure = data.procedure
    this.precision = data.precision
    this.note      = data.note
  }

  build(){
    const o = DCreate('DIV', {id:`operation-${this.index}`, class:'operation-manuel'})
    const tit = DCreate('DIV',{class:'operation-titre', text: this.operation})
    listen(tit, 'click', this.toggleProcedure.bind(this))
    o.appendChild(tit)
    const proc = DCreate('DIV', {class:'operation-procedure hidden', text: this.codeProcedure()})
    if ( this.precision ){
      proc.appendChild(DCreate('DIV', {class:'operation-precision', text:this.precision}))
    }
    o.appendChild(proc)
    this.divProc = proc
    this.obj = o
    return this.obj // pour le mettre tout de suite
  }

  codeProcedure(){
    var c = this.procedure.map(p => `<li>${p}</li>`).join('')
    return '<ul>' + c + '</ul>'
  }

  toggleProcedure(e){
    this.divProc.classList[ this.isOpened ? 'add' : 'remove']('hidden')
    this.isOpened = !this.isOpened
    return stopEvent(e)
  }

}


class ManuelShortcut {
  constructor(data){
    this.data = data
    this.index      = data.index
    this.operation  = data.operation
    this.shortcut   = data.shortcut
    this.precision  = data.precision
    this.note       = data.note
  }

  /**
   * Construction de cette ligne pour le raccourci
   * 
   */
  build(){
    const o = DCreate('TR', {class:'shortcut_tr'})
    o.appendChild(DCreate('TD', {text: this.operation, class:'ope_td'}))
    o.appendChild(DCreate('TD', {text: this.shortcut, class:'shortcut_td'}))
    o.appendChild(DCreate('TD', {text: this.precision || '', class:'precision_td'}))
    this.obj = o
    return o
  }
}
