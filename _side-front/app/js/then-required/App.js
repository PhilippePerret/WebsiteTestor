'use strict'

window.name = "Mon application testeur";

// window.addEventListener('message', (retour) => {
//   console.log("Mes données reçues", retour.data)
// })

Object.assign(App,{

  async onInit(){

    // Placer là où ça doit être TODO
    UI.interface = document.getElementById('interface').contentWindow;

    /*
      Mettre ici le code à exécuter à l'initialisation de l'application
      (après le chargement complet de la page)
    */
    // const dstURI    = 'http://localhost/AlwaysData/Icare_AD_2018/'
    // const dstFolder = path.join(App.homeDirectory,'Sites','AlwaysData','Icare_AD_2018')
    // await SWTestor.open(dstURI, dstFolder)

    // Y a-t-il un dernier site testé ?
    var lastSite = this.prefs.get('lastSiteChecked')
    if ( lastSite ) {
      var [pth,url] = lastSite.split('::')
      SWTestor.open({sitePath:nullIfEmpty(pth), siteUrl:nullIfEmpty(url)})
    }

  }

, error(errMsg){
    console.error(errMsg)
  }
, onError(err){
    console.error(err)
    Flash.warn("Une erreur est survenue. Consultez la console.")
  }
})
