'use strict'
/**
  Programme prinipal pour l'interface
**/
// console.log("window.parent = ", window.parent)
// window.parent.postMessage({maDonnee:"Ma valeur"}, '*')

// window.addEventListener('message', retour => {
//   console.log("Message reçu de la fenêtre principale : ", retour.data)
// })

function site(){
  return document.getElementById('site').contentWindow
}

document.addEventListener('DOMContentLoaded', function(event) {
  console.log("La page de l'interface est prête.")

  document.getElementById('site').contentWindow.addEventListener('DOMContentLoaded', event => {
    console.log("La page du site est prête.")
    // On envoie un message à l'interface pour dire que le site est prêt
    swtInterface.sendTestor({'firstReady':true})
  })

})
