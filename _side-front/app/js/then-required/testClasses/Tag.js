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
    this.inverse  = false
  }

  /**
    Inversion de la commande qui suit
    Note : sera "dépolarisé" (remise à false) dès utilisation.
  **/
  get not() {
    this.inverse = true
    return this // chainage
  }

  /** ---------------------------------------------------------------------
    *   SOUS METHODES DE TESTS
    *
    * Normalement, chaque sous-méthode de test doit produire un cas
    * à évaluer
  *** --------------------------------------------------------------------- */

  /**
    Tester la présente (ou non présence)
  **/
  exists(options){
    var type = (options&&options.checkOnly)?'verification':'expectation'
    const tcase = new TCase(this, type, 'exists')
    tcase.set({
        subject: this.selector
      , eval:`!!document.querySelector("${this.selector.replace(/"/g,'\\"')}")`
      , waitFor: this.selector
      , expected: true
      , options: options
      , inverse: this.inverse
    })
  }
  existsMessages(){
    return {
        success: `La balise ${this.selector} existe`
      , failure: `la balise ${this.selector} devrait exister`
      , successInverse: `la balise ${this.selector} est bien absente`
      , failureInverse: `la balise ${this.selector} ne devrait pas exister`
    }
  }
  existsEvaluate(data){
    console.log("Data pour évaluation : ", data)
    data.success = !data.inverse == (data.expected == data.result)
  }

  /**
    Tester qu'une balise contienne un texte ou du code
  **/
  contains(expected, options){
    var type = (options&&options.checkOnly)?'verification':'expectation'
    const tcase = new TCase(this, type, 'contains')
    tcase.set({
        subject: this.selector
      , eval:`document.querySelector("${this.selector}").innerHTML`
      , waitFor: this.selector
      , expected: expected
      , options: options
      , inverse: this.inverse
    })
    // On dépolarise tout de suite
    if ( this.inverse === true ) this.inverse = false
  }
  containsMessages(data){
    return {
      success: `La balise ${this.selector} contient "${data.expected}"`
    , failure: `La balise ${this.selector} devrait contenir "${data.expected}"`
    , successInverse: `La balise ${this.selector} ne contient pas "${data.expected}"`
    , failureInverse: `La balise ${this.selector} ne devrait pas contenir "${data.expected}"`
    }
  }
  containsEvaluate(data){
    data.success = !data.inverse == (data.expected == data.result)
    console.log("Data À LA FIN APRÈS ÉVALUATION : ", data)
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
  fillWith(values, options){
    const tcase = new TCase(this, 'operation', this.method)
    tcase.set({
        subject: this.selector
      , waitFor: this.selector
      , action: 'fill'
      , values: values
      , h_operation: `L'utilisateur remplit le formualaire '${this.selector}' avec les valeurs ${JSON.stringify(values)}.`
      , options: options
    })
    return this // pour le chainage
  }

  andSubmit(options){
    const tcase = new TCase(this, 'operation', 'submit')
    var data_tcase = {
        subject: this.selector
      , waitFor: this.selector
      , action: 'submit'
      , h_operation: `L'utilisateur soumet le formulaire '${this.selector}'.`
    }
    if ( options && (options.button || options.submitButton) ) {
      Object.assign(data_tcase, {submitButton:options.button||options.submitButton})
    }
    tcase.set(data_tcase)
    return this // chainage
  }
  submit(options){return this.andSubmit(options)}


  /** ---------------------------------------------------------------------
    *   Méthodes d'évaluation
    *
  *** --------------------------------------------------------------------- */




}
