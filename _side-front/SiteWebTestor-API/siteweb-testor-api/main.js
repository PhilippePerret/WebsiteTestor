'use strict'
/**
  Programme prinipal pour l'interface
**/
console.log("window.parent = ", window.parent)
window.parent.postMessage({maDonnee:"Ma valeur"}, '*')

window.addEventListener('message', retour => {
  console.log("Message reçu de la fenêtre principale : ", retour.data)
})

function site(){
  return document.getElementById('site').contentWindow
}

document.addEventListener('DOMContentLoaded', function(event) {
  console.log("La page de l'interface est prête.")
  // console.log("window.parent.name = ", window.parent.name)
  document.getElementById('site').contentWindow.addEventListener('DOMContentLoaded', event => {
    console.log("La page du site est prête.")
    site().document.querySelector('a#login-button').click()
  })
  // // Quand la page est prête
  // setTimeout(()=>{
  //   const loc = window.location
  //   const titreButton = doc().querySelector('a#signup-button').innerHTML
  //   console.log("Titre", titreButton)
  //   const button = doc().getElementById('login-button')
  //   console.log("button = ", button)
  //   button.click()
  //   document.write(`{"result":"Pour voir le résultat", "location":"${loc}"}`)
  // },4000)
})
