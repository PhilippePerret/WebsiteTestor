'use strict'
/** ---------------------------------------------------------------------
  *   Classe SITE
  *   -----------
  *   Le site en cours de test
*** --------------------------------------------------------------------- */

// Pour utiliser `site` partout dans le code pour avoir accès au site courant
window.site = null ;


class Site {
  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
    Ouvre l'url dans la fenêtre du site
  **/
  static open(url, params){
    this.current = new Site(url, params)
    this.current.load()
  }

  static get current(){return this._current}
  static set current(v){
    this._current = v
    window.site = v
  }

  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  /**
    Instanciation d'un nouveau site
  **/
  constructor(url, params){
    this.url    = url
    this.params = params
  }

  /** ---------------------------------------------------------------------
    *
    *   Méthodes de tests
    *
  *** --------------------------------------------------------------------- */
  hasCss(selector, args){
    return (new Expectation(this.findInPage(selector, args), args)).result
  }
  notHasCss(selector,args){
    return (new Expectation(!this.findInPage(selector, args), args)).result
  }

  /** ---------------------------------------------------------------------
    *
    * Méthodes d'interaction
    *
  *** --------------------------------------------------------------------- */
  click(selector, args){
    if (this.findInPage(selector, args)){
      this.container.querySelector(selector).click()
      return true
    } else {
      App.error(`# Impossible de trouver l'élément à cliquer ${selector}…`)
      return false
    }
  }

  fill(form, values){
    console.log("Je dois remplir le formulaire avec",form, values)
  }

  /** ---------------------------------------------------------------------
    *   SOUS-MÉTHODES DE TEST
    *
  *** --------------------------------------------------------------------- */


  exec(code, options){
    ipcRenderer.send('executeJS', {code:code, options:options})
  }

  execResult(result) {
    console.log("-> execResult", result)
  }


  findInPage(selector, args){

    this.exec('console.clear();console.log("Pour voir un message")')
    this.exec(`function qSel(selector){return !!document.querySelector(selector)};var res = qSel("${selector}");console.log("Res : ", res); const fs = require('fs');fs.writeFileSync("./test-res-from-executeJS.json", JSON.stringify({result:res}),'utf8');`)
    return

    if (!this.container.querySelector(selector)){return false}
    if (undefined === args) return true
    // S'il y a des arguments, il faut chercher dans tous les sélecteurs
    // possibles
    var allSelectors = [].slice.call(this.container.querySelectorAll(selector))
    console.log("allSelectors = ",allSelectors)
    args.text = args.text || args.inner
    var sel
    while ( sel = allSelectors.shift() ){
      if ( args.text ) {
        if ( sel.innerHTML.match(args.text) ) {
          return true
        }
      }
    }
    return false
  }
  /**
    Chargement du site dans la page

    +url+ permet de définir une autre path que celle du site, avec des routes
    et des query-strings
  **/
  load(url){
    ipcRenderer.send('load-url', {url:url||this.url, params:this.params})
    // return new Promise((ok,ko)=>{
    //   exec(`curl --no-verbose "${url||this.url}"`, (err, stdout, stderr) => {
    //     this.container.innerHTML = stdout
    //     this.prepare()
    //     ok()
    //   })
    // })
  }

  /**
    Prépare la page pour être testable
    Pour le moment, ce sont tous les <a> et les boutons qu'on transforme
  **/
  prepare(){
    this.container.querySelectorAll('a').forEach(link => {
      var href = link.href
      link.href = 'javascript:alert("Pour voir")'
      console.log("Traitement du lien '%s'", href)
      link.setAttribute('onclick', this.onClick.bind(this, href))
    })
  }

  onClick(ev, href){
    console.log("Clic sur '%s'", href)
    stopEvent(ev) // doit empêcher le href de s'exécuter
  }

  get container(){
    return this._container || (this._container = UI.siteContainer)
  }

}

ipcRenderer.on('res-from-executeJS', function(event, err){
  if ( err ) {
    App.onError(err)
  } else {
    var sol = JSON.parse(fs.readFileSync('./test-res-from-executeJS.json','utf8'))
    // console.log("Retour de executeJavaScript sur le site  = ", sol)
    site.execResult(sol)
  }
})
