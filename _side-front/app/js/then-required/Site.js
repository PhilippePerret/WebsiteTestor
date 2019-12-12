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
    (version avec interface)
  **/
  static open(url, params){
    this.current = new Site(url, params)
    // Il faut copier l'interface sur le site
    // Pour le moment, on le fait de façon statique, mais ce sera dynamique ensuite
    const srcFolder = path.join('.','_side-front','SiteWebTestor-API','siteweb-testor-api')
    const dstFolder = path.join(App.homeDirectory,'Sites','AlwaysData','Icare_AD_2018','siteweb-testor-api')
    fs.existsSync(dstFolder) || fs.mkdirSync(dstFolder)
    var mainHasBeenUpdated = false
    // sera mis à true si une actualisation a été nécessaire, pour savoir
    // s'il faudra actualiser le fichier main.html
    var noUpdateRequired = true
    for(var nfile of ['main.html','main.js','api.js','main.css']){
      var src = path.join(srcFolder, nfile)
      var dst = path.join(dstFolder, nfile)
      if ( !fs.existsSync(dst) || (fs.statSync(src).mtime > fs.statSync(dst).mtime) ){
        console.log("Création/actualisation du fichier '%s'", dst)
        fs.existsSync(dst) && fs.unlinkSync(dst)
        if ( nfile == 'main.html') {
          this.updateMainHtmlFile(srcFolder,dstFolder)
          mainHasBeenUpdated = true
        } else {
          fs.copyFileSync(src,dst)
          noUpdateRequired = false
        }
      }
    }
    // Actualiser aussi main.html si nécessaire
    mainHasBeenUpdated || noUpdateRequired || this.updateMainHtmlFile(srcFolder,dstFolder)

    // Maintenant que l'interface est prête sur le site, on peut le charger
    // Le chargement correspond à ouvrir le fichier main.html dans
    // l'iframe#interface qui va lui-même ouvrir le site dans son iframe#site
    this.current.load()
  }

  static updateMainHtmlFile(srcFolder,dstFolder){
    var src = path.join(srcFolder,'main.html')
    var dst = path.join(dstFolder,'main.html')
    var code = fs.readFileSync(src,'utf8')
    code = code.replace(/_TIME_/g, String(Number(new Date())))
    fs.writeFileSync(dst,code,'utf8')
  }
  // /**
  //   Ouvre l'url dans la fenêtre du site (OLD VERSION)
  // **/
  // static open(url, params){
  //   this.current = new Site(url, params)
  //   this.current.load()
  // }

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

    this.hasCss = this.hasCss.bind(this)
    this.click  = this.click.bind(this)
    // this.afterClick = this.afterClick.bind(this)
    // this.afterSearchInPage = this.afterSearchInPage.bind(this)
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
  click(selector,args){

  }
  fill(selector,args){

  }
  // click(selector, args){
  //   selector = selector.replace(/\"/g,'\\"')
  //   return this.exec(
  //       `function(){document.querySelector("${selector}").click();return true}`
  //   ).then(this.afterClick)
  // }
  // afterClick(res){
  //   console.log("resultat du click :", res)
  // }
  //
  // fill(form, values){
  //   console.log("Je dois remplir le formulaire avec",form, values)
  // }

  /** ---------------------------------------------------------------------
    *   SOUS-MÉTHODES DE TEST
    *
  *** --------------------------------------------------------------------- */

  async searchInPage(selector, args){
    return false
  }

  /**
    Chargement du site dans la page

    +url+ permet de définir une autre path que celle du site, avec des routes
    et des query-strings
  **/
  load(url){
    // this.container.src = url || this.url
    // TODO Faire une classe SWTInterface si ça fonctionne
    this.interface.src = path.join(this.url,'siteweb-testor-api','main.html')
  }

  get interface(){
    return this._interface || (this._interface = DGet('iframe#interface'))
  }

  // get container(){
  //   return this._container || (this._container = UI.siteContainer)
  // }

}

// ipcRenderer.on('res-from-executeJS', function(event, err){
//   if ( err ) {
//     App.onError(err)
//   } else {
//     var sol = JSON.parse(fs.readFileSync(site.relPathExecuteJSResult,'utf8'))
//     // console.log("Retour de executeJavaScript sur le site  = ", sol)
//     site.execResult(sol)
//   }
// })
