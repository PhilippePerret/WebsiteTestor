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

  /**
    Méthode d'évaluation générale commune à tous les sujets

    Elle va appeler la méthode propre d'évaluation du sujet en fonction de
    la méthode employée.
    Elle gère aussi et avant le cas où une erreur (de test ou système) a été
    rencontrée.

  **/
  evaluate(data){
    var evaluateMethod = `${data.method}Evaluate`
    console.log("-> <%s>.evaluate", this.constructor.name, data)
    if ( data.systemError ) {
      // <= Une erreur système a été rencontrée
      // => Il faut l'indiquer et interrompre cette feuille de test
      console.error("[ERREUR SYSTÈME]", data.systemError)
    } else if ( data.error ) {
      // <= Une erreur de test a été rencontrée
      // => Il faut interrompre cette feuille de tests
      console.error("[ERREUR TEST]", data.error)
    } else if (data.type == 'expectation') {
      console.log("Expectation, méthode d'évaluation :", evaluateMethod)
      this[evaluateMethod].call(this, data)
    } else if ( data.expected && data.expected != data.result ) {
      console.warn("Le résultat ne correspond pas aux attentes")
    } else if (this[evaluateMethod] instanceof Function) {
      // Si la méthode d'évaluation existe (comme par exemple pour les
      // 'it')
      console.log("La méthode d'évaluation '%s' existe, je l'appelle", evaluateMethod)
      this[evaluateMethod].call(this,data)
    }
  }

}
