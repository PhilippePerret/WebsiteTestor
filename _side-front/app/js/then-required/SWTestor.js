'use strict'
/** ---------------------------------------------------------------------
  *   Classe SWTestor
  *   ---------------
  *   Le testeur de site en cours
*** --------------------------------------------------------------------- */


class SWTestor {
  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
    Ouvre l'url dans la fenêtre du site
    (version avec interface)
  **/
  static open(url, dstFolder){
    this.current = new SWTestor(url, dstFolder)
    this.current.prepareForTests()
    this.current.load()
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

    param {String} url    URI du site distant ou local
    param {String} folder Dossier physique distant ou local contenant l'index
                          du site.
  **/
  constructor(url, folder){
    this.url    = url
    this.folder = folder

    this.hasCss = this.hasCss.bind(this)
    this.click  = this.click.bind(this)
    // this.afterClick = this.afterClick.bind(this)
    // this.afterSearchInPage = this.afterSearchInPage.bind(this)
  }

  /**
    Lancement des tests
  **/
  start(){
    console.log("-> testor.start()")
    // this.casesList = [
    //     {message: "Je vais lancer les tests."}
    //   , {eval: 'document.querySelector("div#titre_site").innerHTML'}
    //   , {click: 'a[href="signup"]', waitFor:'form#form_user_signup'}
    //   , {fill: 'form#form_user_signup', values: {user_pseudo:'Phil2.0', user_mail:'phil@chez.lui'}}
    //   // , {eval:'document.querySelector("form#form_user_signup")'}
    // ]

    // On charge toutes les feuilles de test
    // TODO Plus tard, les prendre sur le site, dans le dossier siteweb-testor-api
    // TODO Pour le moment, on les prend dans le dossier swtTests ici
    var testFiles = fs.readdirSync("./swtTests",'utf8')
    console.log("testFiles", testFiles)

    const testsFolder = '../swtTests'
    testFiles.forEach( p => {
      // Il faut faire un nouveau SWTest
      var ptest = `${testsFolder}/${p}`
      SWTest.current = new SWTest(this, ptest)
      require(ptest)
    })

    // Exemple : tester que le div#titre_site soit bien "Atelier Icare"
    // Le code du test doit être :
    //  tag('div#titre_site').contains('Atelier Icare')
    // Il faudrait que cette ligne produise :
    //    - envoi de {eval:DGet('...').innerHTML, expected:'Atelier Icare'}
    //
    // Si je ne veux pas qu'il y ait trop de code côté site, il faut
    // décomposer au maximum ici. Donc, être capable, ici, de
    // déterminer que 'tag(...).contains(...)' corresponde à la lecture
    // d'une balise et de son contenu, et que son contenu soit égal à la
    // valeur attendu.
    // Ici, 'tag(...)' pourrait appeler une méthode qui va chercher la balise
    // correspondante.

    this.runNextTest()
  }

  runNextTest(){
    console.log("-> runNextTest")
    var curTest = SWTest.items.shift()
    if (curTest) {
      // <= il y a encore des feuilles de test à jouer
      // => On joue la feuille de test
      console.log("curTest:", curTest)
      curTest.run()
    } else {
      // <= Il n'y a plus de feuille de test à jouer
      // => On peut afficher le rapport
      this.displayReport()
    }
  }

  displayReport(){
    console.log("= RAPPORT DE FIN DES TESTS =")
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
    this.sendToSite({click:'a[href="signup"]'})
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

  /** ---------------------------------------------------------------------
    *   Messages de communication
    *
  *** --------------------------------------------------------------------- */

  /**
    Raccourci pour envoyer des données au site
  **/
  sendToSite(data){
    this.interface.send(data)
  }

  /**
    Raccourci pour envoyer un message sur le site. Note : ça ne fait que
    l'afficher en console.
  **/
  sendMessage(msg){
    this.interface.send({message: msg})
  }

  /**
    Chargement du site dans la page

    +url+ permet de définir une autre path que celle du site, avec des routes
    et des query-strings
  **/
  load(url){
    this.interface.src(path.join(this.url,'siteweb-testor-api','main.html'))
  }

  get interface(){
    return this._interface || (this._interface = this.initInterface())
  }

  initInterface(){
    const inter = new SWTInterface(this)
    window.addEventListener('message', inter.onMessage.bind(inter))
    return inter
  }

  // get container(){
  //   return this._container || (this._container = UI.siteContainer)
  // }

  prepareForTests(){
    // Il faut copier l'interface sur le site
    // Pour le moment, on le fait de façon statique, mais ce sera dynamique ensuite
    const srcFolder = path.join('.','_side-front','SiteWebTestor-API','siteweb-testor-api')
    const dstFolder = path.join(this.folder, 'siteweb-testor-api')
    fs.existsSync(dstFolder) || fs.mkdirSync(dstFolder)

    // Par défaut, on considère que le fichier main.html est à jour
    var mainIsUpToDate = true
    // sera mis à true si une actualisation a été nécessaire, pour savoir
    // s'il faudra actualiser le fichier main.html
    var noUpdateRequired = true
    // On récupère tous les fichiers à copier (il faut qu'il y en ait le
    // moins possible)
    // Note : quand l'application sera entièrement prête, on pourra ne faire
    // qu'une seule fois le travail pour un site donné. Ici, on vérifie l'anté-
    // riorité pour avoir toujours un site à jour.
    var nfiles = fs.readdirSync(srcFolder,'utf8').map( p => path.basename(p))
    for(var nfile of nfiles){
      var src = path.join(srcFolder, nfile)
      var dst = path.join(dstFolder, nfile)
      if ( !fs.existsSync(dst) || (fs.statSync(src).mtime > fs.statSync(dst).mtime) ){
        // console.log("Création/actualisation du fichier '%s'", dst)
        fs.existsSync(dst) && fs.unlinkSync(dst)
        if ( nfile == 'main.html') {
          mainIsUpToDate = false
        } else {
          fs.copyFileSync(src,dst)
          noUpdateRequired = false
        }
      }
    }
    // Actualiser aussi main.html si nécessaire
    ;(mainIsUpToDate && noUpdateRequired) || this.updateMainHtmlFile(srcFolder,dstFolder)
  }
  updateMainHtmlFile(srcFolder,dstFolder){
    var src = path.join(srcFolder,'main.html')
    var dst = path.join(dstFolder,'main.html')
    var code = fs.readFileSync(src,'utf8')
    code = code.replace(/_TIME_/g, String(Number(new Date())))
    fs.writeFileSync(dst,code,'utf8')
  }

} //SWTestor
