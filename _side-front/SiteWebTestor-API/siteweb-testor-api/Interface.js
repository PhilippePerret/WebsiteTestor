'use strict'
/** ---------------------------------------------------------------------
  *   API pour la communication entre le site (dans l'iframe) et le testeur
  *
*** --------------------------------------------------------------------- */
class Interface {

  /** ---------------------------------------------------------------------
    *
    * INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(parentWindow /* window.parent */){
    // this.data = data
    this.parent = parentWindow
    this.receiveFromTestor = this.receiveFromTestor.bind(this)
  }

  /**
    Méthode utilisée pour envoyer un message au testeur
  **/
  sendTestor(data){
    Object.assign(data, {responseTime: new Date().getTime()})
    this.parent.postMessage(data, '*')
  }

  /**
    Méthode recevant les messages du testeur
  **/
  receiveFromTestor(ev){
    const data = ev.data
    console.log("Données reçues du testeur :", data)
    data.message && console.log("[Testor] %s", data.message)
    var result
    if ( data.eval ) {
      try {
        // On évalue le code sur le site
        result = this.iframe.contentWindow.eval(data.eval)
        // Et on place le résultat dans la data, pour la renvoyer
        // TODO Voir quoi faire lorsque c'est du code asynchrone
        Object.assign(data, {result: result})
        // console.log("Résultat de l'évaluation : ", result)
      } catch (e) {
        console.error(e)
        Object.assign(data,{error:e})
      }
    }
    if ( data.click ) {
      // Bouton ou lien à cliquer
      this.iframe.contentWindow.document.querySelector(data.click).click()
    }
    // Et on peut renvoyer le résultat
    this.sendTestor(data)
  }

  get iframe(){
    return this._iframe || (this._iframe = document.querySelector('iframe#site'))
  }
}

const swtInterface = new Interface(window.parent)
window.addEventListener('message', swtInterface.receiveFromTestor)
