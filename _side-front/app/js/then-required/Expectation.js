'use strict'
/** ---------------------------------------------------------------------
  *   Class Expectation
  *   -----------------
  *   Gestion des success, failures et pendings
*** --------------------------------------------------------------------- */
class Expectation {

  /** ---------------------------------------------------------------------
    *
    * INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor( resultatOK, params ){
    this.ok     = !!resultatOK
    this.params = params
  }

  get result(){
    return this.ok
  }
}
