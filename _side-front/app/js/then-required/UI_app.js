'use strict'
Object.assign(UI,{
  type: 'Extension de UI'

, setDimensions(){
    const my = this
        , hwindow = this.UI_HEIGHT
        , hfooter = UI.footer.offsetHeight
        , innerHeight = `${hwindow - (hfooter + 20)}px`

    // Hauteur du rapport
    this.report.style.height = innerHeight
  }

})
Object.defineProperties(UI,{

  /**
    La partie contenant le site
  **/
  siteContainer:{get(){return this._sitecontainer || (this._sitecontainer = DGet('#site'))}}

  /**
    La partie pour écrire le rapport
  **/
, report:{get(){return this._report || (this._report = DGet('#report'))}}

  /**
    Élément DOM contenant la feuille de test courante
  **/
, testContainer:{get(){return this._testcontainer || (this._testcontainer = DGet('#test'))}}
})
