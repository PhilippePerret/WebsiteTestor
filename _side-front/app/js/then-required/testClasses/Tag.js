'use strict'
/** ---------------------------------------------------------------------
  *
  * Class Tag
  *
*** --------------------------------------------------------------------- */
class Tag extends SWTSubject {

  constructor(selector){
    super()
    this.selector = selector
    this.context  = 'Dom'
  }

  /** ---------------------------------------------------------------------
    *   SOUS METHODES DE TESTS
    *
    * Normalement, chaque sous-méthode de test doit produire un cas
    * à évaluer
  *** --------------------------------------------------------------------- */
  contains(expected, options){
    const tcase = new TCase(this, 'expectation', 'contains')
    tcase.set({
        subject: this.selector
      , eval:`document.querySelector("${this.selector}").innerHTML`
      , waitFor: this.selector
      , expectedValue: expected
      , options: options
    })
  }

  /**
    Sous-méthode pour cliquer un élément dans la page. Son raccourci pour
    les tests porte le même nom (click(<selector>))
    La méthode attend que l'élément soit visible dans la page.
  **/
  click(options){
    const tcase = new TCase(this,'operation', 'click')
    tcase.set({
        subject: this.selector
      , action: 'click'
      , waitFor: this.selector
      , h_operation: `L'utilisateur clique sur ${this.selector}`
      , options: options
    })
    return this // pour le chainage
  }

  /**
    Remplit un formulaire
  **/
  with(values, options){
    const tcase = new TCase(this, 'operation', this.method)
    tcase.set({
        subject: this.selector
      , action: 'fill'
      , values: values
      , h_operation: `L'utilisateur remplit le formualaire '${this.selector}' avec les valeurs ${JSON.stringify(values)}.`
    })
    return this // pour le chainage
  }

  andSubmit(options){
    const tcase = new TCase(this, 'operation', 'submit')
    tcase.set({
        subject: this.selector
      , waitFor: this.selector
      , action: 'submit'
      , h_operation: `L'utilisateur soumet le formulaire '${this.selector}'.`
    })
    return this // chainage
  }
  submit(options){return this.andSubmit(options)}
}
