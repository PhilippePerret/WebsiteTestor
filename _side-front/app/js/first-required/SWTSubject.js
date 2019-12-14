'use strict'
/** ---------------------------------------------------------------------
  *   Classe SWTSubject
  *   -----------------
  *   Classe abstraite de tous les "sujets" de test (tag, str, db, etc.)
  *
*** --------------------------------------------------------------------- */
class SWTSubject {

  constructor(data){
    this.data = data
  }

  run(){
    this.testor.sendToSite(Object.assign(this.code, {swtest: this.swtest.id}))
  }


}
