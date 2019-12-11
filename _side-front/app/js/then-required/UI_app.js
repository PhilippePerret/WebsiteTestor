'use strict'
Object.assign(UI,{
  type: 'Extension de UI'

, setDimensions(){
    const my = this
        , hwindow = this.UI_HEIGHT
        , hfooter = UI.footer.offsetHeight
        , innerHeight = `${hwindow - (hfooter + 100)}px`

    this.siteContainer.style.height = innerHeight
  }

})
Object.defineProperties(UI,{

  /**
    La partie contenant le site
  **/
  siteContainer:{get(){return this._sitecontainer || (this._sitecontainer = DGet('#site'))}}

  /**
    Élément DOM contenant la feuille de test courante
  **/
, testContainer:{get(){return this._testcontainer || (this._testcontainer = DGet('#test'))}}
})
