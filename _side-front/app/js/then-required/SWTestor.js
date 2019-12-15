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

    // TODO Pour l'application finale, utiliser la première méthode (qui ne
    // recrée pas chaque fois tout le dossier sur le site)
    // this.current.prepareForTests()
    this.current.prepareForTestsModeDev()

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

    param {String} url    URI du site distant ou local
    param {String} folder Dossier physique distant ou local contenant l'index
                          du site.
  **/
  constructor(url, folder){
    this.url    = url
    this.sitewebFolder = folder
  }

  /**
    Lancement des tests
  **/
  start(){
    console.log("-> testor.start()")

    // On charge toutes les feuilles de test
    // TODO Plus tard, les prendre sur le site, dans le dossier siteweb-testor-api
    // TODO Pour le moment, on les prend dans le dossier swtTests ici

    var testFiles = fs.readdirSync("./swtTests",'utf8')
    console.log("testFiles", testFiles)

    const testsFolder = '../swtTests'
    for(var itest = 0, len = testFiles.length; itest < len; ++itest){
      var p = testFiles[itest]
      // Création d'un nouveau SWTest
      var ptest = `${testsFolder}/${p}`
      SWTest.current = new SWTest(this, ptest)
      try { require(ptest) }
      catch (e) {
        // On passe ici en cas d'erreur d'écriture dans le fichier
        this.report(`ERREUR D'ÉCRITURE DANS LE FICHIER '${ptest}' à la ligne ${e.lineNumber} : ${e.message}\n${e.stack}`, 'failure', {raw:true})
        if ( this.config.get('failFast') ){
          // console.log("Failfast est activé, on s'arrête tout de suite")
          this.report('FAIL-FAST ACTIVÉ', 'failure', {before:"\n"})
          return this.endTests()
        }
      }
    }

    this.startTests()
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
      this.endTests()
    }
  }

  startTests(){
    this.report("Lancement des tests", 'notice', {withTime:true, after:"\n\n"})
    this.runNextTest()
  }
  endTests(){
    this.report("Fin des tests", 'notice', {withTime:true, before:"\n\n"})
  }


  /**
    Raccourci pour communiquer avec le site
  **/
  sendToSite(data){
    this.interface.send(data)
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

  report(msg, type, options){
    this._report || (this._report = new SWTReport(this))
    this._report.write(msg, type, options)
  }

  get config(){
    return this._config || (this._config = new PConfig(this))
  }
  get configPath(){
    return this._configpath || (this._configpath = path.join(this.sitewebFolder,'.swt-config.json'))
  }
  // get container(){
  //   return this._container || (this._container = UI.siteContainer)
  // }

  /**
    Préparation du dossier pour le site en mode développement
    En mode normal, on ne reconstruit le dossier que si des fichiers ont
    été modifiés, mais en mode développement, on recrée chaque fois tous
    les fichiers
  **/
  prepareForTestsModeDev(){
    console.log("-> SWTestor#prepareForTestsModeDev (dossier pour le site)")
    // Il faut copier l'interface sur le site
    // Pour le moment, on le fait de façon statique, mais ce sera dynamique ensuite
    const srcFolder = path.join('.','_side-front','SiteWebTestor-API','siteweb-testor-api')
    const dstFolder = path.join(this.sitewebFolder, 'siteweb-testor-api')
    // Pour le moment, on recrée à chaque fois
    fs.existsSync(dstFolder) && execSync(`rm -rf "${dstFolder}"`)
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
    // Pour mémoriser la liste des scripts (plus tard, on les ajoutera
    // dynamiquement)
    var scripts = []
    // Pour mémoriser les css
    var csss = []
    // Now pour forcer le chargement
    const now = String(Number(new Date()))
    // On boucle sur chaque fichier
    for(var nfile of nfiles){
      if ( nfile == 'main.html' ) {
        continue
      } else {
        // Le nouveau nom unique du fichier
        var unfile = path.basename(nfile, path.extname(nfile)) + now + path.extname(nfile)
        // console.log("unfile = '%s'", unfile)
        var src = path.join(srcFolder, nfile)
        var dst = path.join(dstFolder, unfile)
        console.log("Création du fichier '%s'", dst)
        fs.existsSync(dst) && fs.unlinkSync(dst)
        fs.copyFileSync(src, dst)
        noUpdateRequired = false
        if ( nfile.endsWith('.js') ) {
          scripts.push(unfile)
        } else if (nfile.endsWith('.css')){
          csss.push(unfile)
        }
      }//si ce n'est pas le fichier main.html
    }
    // Actualiser aussi main.html
    this.updateMainHtmlFile(srcFolder,dstFolder, csss, scripts)
  }

  prepareForTests(){
    console.log("-> SWTestor#prepareForTests (dossier pour le site)")
    // Il faut copier l'interface sur le site
    // Pour le moment, on le fait de façon statique, mais ce sera dynamique ensuite
    const srcFolder = path.join('.','_side-front','SiteWebTestor-API','siteweb-testor-api')
    const dstFolder = path.join(this.sitewebFolder, 'siteweb-testor-api')
    // Pour le moment, on recrée à chaque fois
    fs.existsSync(dstFolder) && execSync(`rm -rf "${dstFolder}"`)
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
    // Pour mémoriser la liste des scripts (plus tard, on les ajoutera
    // dynamiquement)
    var scripts = []
    // Pour mémoriser les css
    var csss = []
    // Now pour forcer le chargement
    const now = String(Number(new Date()))
    for(var nfile of nfiles){
      // Le nouveau nom unique du fichier
      // Note : il n'est pas encore utilisé car il serait changé chaque fois
      // que les tests seraient lancés, sinon
      var unfile = path.basename(nfile, path.extname(nfile)) + now + path.extname(nfile)
      // console.log("unfile = '%s'", unfile)
      var src = path.join(srcFolder, nfile)
      var dst = path.join(dstFolder, nfile)
      if ( !fs.existsSync(dst) || (fs.statSync(src).mtime > fs.statSync(dst).mtime) ){
        if ( nfile == 'main.html' ) {
          mainIsUpToDate = false
          continue
        } else {
          console.log("Création/actualisation du fichier '%s'", dst)
          fs.existsSync(dst) && fs.unlinkSync(dst)
          fs.copyFileSync(src,dst)
          noUpdateRequired = false
          // Si c'est un fichier javascript, il faut le garder pour le charger
          if ( nfile.endsWith('.js') ) {
            scripts.push(unfile)
          } else if (nfile.endsWith('.css')) {
            csss.push(unfile)
          }
        }
      }
    }
    // Actualiser aussi main.html si nécessaire
    ;(mainIsUpToDate && noUpdateRequired) || this.updateMainHtmlFile(srcFolder,dstFolder, csss, scripts)
  }
  updateMainHtmlFile(srcFolder,dstFolder, csss, scripts){
    var src = path.join(srcFolder,'main.html')
    var dst = path.join(dstFolder,'main.html')
    var code = fs.readFileSync(src,'utf8')
    code = code.replace(/_TIME_/g, String(Number(new Date())))
    // Remplacement le code des scripts
    let scriptsCode = scripts.map(nfile=>`<script type="text/javascript" src="${nfile}"></script>`).join("\n")
    code = code.replace(/___JAVASCRIPTS___/g, scriptsCode)
    let csssCode = csss.map(nfile => `<link rel="stylesheet" href="${nfile}">`).join("\n")
    code = code.replace(/___CSSS___/g, csssCode)
    fs.writeFileSync(dst,code,'utf8')
  }

} //SWTestor

Object.defineProperties(window,{
  testor:{get(){return SWTestor.current}}
})
