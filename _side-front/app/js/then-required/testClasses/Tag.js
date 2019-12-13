'use strict'
/** ---------------------------------------------------------------------
  *
  * Class Tag
  *
*** --------------------------------------------------------------------- */
class Tag {

    constructor(selector, options){
      this.selector = selector
      this.options  = options
    }

    /** ---------------------------------------------------------------------
      *   SOUS METHODES DE TESTS
      *
      * Normalement, chaque sous-méthode de test doit produire un cas
      * à évaluer
    *** --------------------------------------------------------------------- */
    is(expected){
      const tcase = new TCase(this)
      tcase.code = {
          eval:`document.querySelector("${this.selector}").innerHTML`
        , waitFor: this.selector
        , expectedValue: expected
      }
    }
}
