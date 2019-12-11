'use strict'
Object.assign(App,{
  async onInit(){
    /*
      Mettre ici le code à exécuter à l'initialisation de l'application
      (après le chargement complet de la page)
    */
    await Site.open('http://localhost/AlwaysData/Icare_AD_2018/')
    await site.searchInPage('section#page-contents')
    await site.searchInPage('a[href="signup"]')
    await site.click('a[href="signup"]')
  }

, error(errMsg){
    console.error(errMsg)
  }
, onError(err){
    console.error(err)
    Flash.warn("Une erreur est survenue. Consultez la console.")
  }
})
