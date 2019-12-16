'use strict'
/** ---------------------------------------------------------------------
  *   SWTInterface
  *   ------------
  *   Gestion de l'interface
  *

Ce qu'on appelle "interface", c'est l'iframe qui va contenir le site
à tester, qui fait donc la communication entre l'instance (Test) et l'instance
{Site} (qui est sa propriété `site`)

*** --------------------------------------------------------------------- */
class SWTInterface {

  /**
    Instanciation
    param {SWTestor}  testor    Le testeur du site.
  **/
  constructor(testor){
    this.testor = testor
  }

  /**
    Réception des messages envoyés par l'interface du site

    Note : en imaginant qu'il puisse y avoir plusieurs sites et donc plusieur
    envois de message, il faudrait être capable d'envoyer dans data une donnée
    qui assurera que c'est le bon récepteur qui reçoit le message (car je pense
    qu'on ne peut pas faire de détail au niveau de l'évènement 'messsage')
  **/
  onMessage(ev){
    const data = ev.data
    // console.log("Message reçu par SWInterface :", data)
    if ( data.NotACase ){
      eval(data.returnMethod).call(null, data)
    } else if ( data.firstReady ) {
      this.testor.ready = true
    } else {
      // Autre message reçu par le site, à traiter
      console.log("[INTERFACE] retourne : ", data)
      // On peut évaluer ou passer à la suite
      TCase.get(data.id).afterRun(data)
      // SWTest.get(data.swtest).afterRunCase(data)
      // this.testor.runNextCase()
    }
  }

  send(data) {
    Object.assign(data, {queryTime: new Date().getTime()})
    this.iframe.contentWindow.postMessage(data,'*')
  }

  /**
    Pour définir, au tout départ, l'URI du site à tester (ou tester une path
    particulière).
  **/
  src(path){
    this.iframe.src = path
  }

  /**
    iframe contenant le site testé
  **/
  get iframe(){
    return this._iframe || (this._iframe = DGet('iframe#interface'))
  }
}
