'use strict'
Object.assign(App,{
  async onInit(){
    /*
      Mettre ici le code à exécuter à l'initialisation de l'application
      (après le chargement complet de la page)
    */
    await Site.open('http://localhost/AlwaysData/Icare_AD_2018/')
    setTimeout(site.findInPage.bind(site, 'section#page-contents'), 1000)
    // require('../assets/test/test-01.js')
  }

, error(errMsg){
    console.error(errMsg)
  }
})
