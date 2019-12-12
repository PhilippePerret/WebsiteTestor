'use strict'

window.name = "Mon application testeur";

window.addEventListener('message', (retour) => {
  console.log("Mes données reçues", retour.data)
})

Object.assign(App,{
  async onInit(){
    TestCode.init()
    /*
      Mettre ici le code à exécuter à l'initialisation de l'application
      (après le chargement complet de la page)
    */
    await Site.open('http://localhost/AlwaysData/Icare_AD_2018/')
    // Site.open('http://./_side-front/essai.html')

    UI.interface = document.getElementById('interface').contentWindow;

    setTimeout(()=>{
      UI.interface.postMessage({"bon baiser":"De Russie"},'*')
    },4000)

  }

, error(errMsg){
    console.error(errMsg)
  }
, onError(err){
    console.error(err)
    Flash.warn("Une erreur est survenue. Consultez la console.")
  }
})
