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

    // Si la propriété waitFor est définie dans les données, il
    // faut attendre la présence de cet élément avant d'exécuter le code
    // Si l'élément n'est pas trouvé après un timeout, on considère que le
    // cas est un échec
    if (data.waitFor) {
      console.log("Je dois attendre sur l'élément '%s'", data.waitFor)
      this.waitFor(data.waitFor)
        .then(this.treateData.bind(this, data))
        .catch(console.error)
    } else {
      this.treateData.bind(this, data)
    }
  }

  treateData(data){
    console.log('-> treateData(data=)', data)
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
      console.log("* Click souris sur élément *")
      // Bouton ou lien à cliquer
      this.siteDocument.querySelector(data.click).click()
      // this.iframe.contentWindow.document.querySelector(data.click).click()
    }
    if ( data.fill ) {
      // Remplissage de formulaire
      console.log("* Remplissage de formulaire *")
      var form = this.siteDocument.querySelector(data.fill)
      for(var id in data.values){
        form.querySelector(`#${id}`).value = data.values[id]
      }
    }

    this.sendTestor.call(this,data)
  }

  /**
    Méthode qui attend que la balise +tag+ soit contenu dans le site pour
    poursuivre

    ON doit avoir une boucle appelée tous les laps temps
    this.timerWaitFor = setIntervalle()
  **/



  waitFor(tag){
    const TIMEOUT = 20
    const LAPS    = 500
    const timeout = new Date().getTime() + TIMEOUT*1000
    return new Promise((ok,ko) => {
      this.timerWaitFor = setInterval(this.checkForTag.bind(this, tag, ok, ko, timeout), LAPS)
    })
  }

  checkForTag(tag, ok, ko, timeout){
    if ( !!this.siteDocument.querySelector(tag) ) {
      // Le tag a été trouvé
      console.log("%s trouvé", tag)
      clearInterval(this.timerWaitFor)
      delete this.timerWaitFor
      ok()
    } else if (new Date().getTime() > timeout) {
      console.log("Timeout dépassé")
      clearInterval(this.timerWaitFor)
      delete this.timerWaitFor
      ko("-Timeout-")
    } else {
      // <= Le tag n'a pas été trouvé
      // => on poursuit
      console.log("%s non trouvé", tag)
    }
  }

  get siteDocument(){
    return this.iframe.contentWindow.document
  }


  get iframe(){
    return this._iframe || (this._iframe = document.querySelector('iframe#site'))
  }
}

const swtInterface = new Interface(window.parent)
window.addEventListener('message', swtInterface.receiveFromTestor)
