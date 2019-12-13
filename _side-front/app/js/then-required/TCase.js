'use strict'
/** ---------------------------------------------------------------------
  *
  * Class TCase
  * -----------
  * Pour la gestion des cases.
  *

De manière générale, un {TCase} correspond à une ligne d'une feuille de
test.
*** --------------------------------------------------------------------- */
class TCase {

  /** ---------------------------------------------------------------------
    *
    * INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(owner){
    this.owner = owner // par exemple une {Tag}
    this.swtest = SWTest.current // forcément le courant, à l'instanciation
    this.testor = this.swtest.testor
    // Dès qu'on instancie un TCase, on l'enregistre dans la pile
    // d'exécution du test.
    SWTest.current.addCase(this)

  }

  run(){
    this.testor.sendToSite(Object.assign(this.code, {swtest: this.swtest.id}))
  }

  evaluate(data){
    console.log("Je vais ÉVALUER les données : ", data)
    if ( data.expectedValue ) {
      // La valeur attendue doit être égale à la valeur trouvée
      var ok = data.expectedValue == data.result
      this.expectation.evaluate(ok)
    } else if (data.evalMethod) {
      // Il faut appeler une méthode particulière d'évaluation
    }
  }

  get expectation(){
    return this._expectation || (this._expectation = new Expectation(this))
  }
}
