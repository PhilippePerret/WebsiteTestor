'use strict'
/** ---------------------------------------------------------------------
  *   API pour la communication entre le site et le testeur
  *
*** --------------------------------------------------------------------- */
class API {
  constructor(data){
    this.data = data
  }
  receive(data){
    this.data = data
  }
  send(){
    return this.result || this.data
  }
}
