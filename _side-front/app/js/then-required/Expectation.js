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
  constructor( owner ){
    this.owner = owner
  }

  evaluate(ok){
    console.log("Le résultat pour ce test est ", ok)
  }
}
