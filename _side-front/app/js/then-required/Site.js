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
    return (new Expectation(this.searchInPage(selector, args), args)).result
  }
  notHasCss(selector,args){
    return (new Expectation(!this.searchInPage(selector, args), args)).result
  }

  /** ---------------------------------------------------------------------
    *
    * Méthodes d'interaction
    *
  *** --------------------------------------------------------------------- */
  click(selector, args){
    if (this.searchInPage(selector, args)){
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

  /**
    Exécution d'un code JS sur le site
    cf. le manuel du développeur pour le détail, car c'est un peu complexe
  **/
  exec(code, callback){
    this.execResult.callback = callback // pour le retour
    // Finalisation du code pour envoi
    var now = Number(new Date())
    code = `var res${now};try{res${now}={code:'${code}',resultat:${code}()}}catch(err){res${now}={error:err.message,backtrace:err.backtrace}};console.log(res${now});const fs${now}=require('fs');fs${now}.writeFileSync("${this.relPathExecuteJSResult}",JSON.stringify(res${now}),'utf8')`
    console.log("Code transmis : ", code)
    ipcRenderer.send('execute-js', {code:code})
  }
  execResult(result) {
    console.log("-> execResult", result)
    this.execResult.callback.call(this, result)
  }

  /**
    Le path du fichier dans lequel sera copié le résultat de l'exécution du
    code JS sur le site.
  **/
  get relPathExecuteJSResult(){return './.result-from-execute-js.json'}

  afterSearchInPage(result){
    console.log("Résultat après la recherche dans la page : ", result)
  }

  searchInPage(selector, args){
    this.exec(`function(){return !!document.querySelector("${selector}")}`, this.afterSearchInPage)
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
    var sol = JSON.parse(fs.readFileSync(site.relPathExecuteJSResult,'utf8'))
    // console.log("Retour de executeJavaScript sur le site  = ", sol)
    site.execResult(sol)
  }
})
