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

  /**
    Écriture du rapport court
  **/
  writeShortReport(){
    UI.report.appendChild(this.reportLine)
  }

  /**
    Les données qui ont fait l'aller-retour du testeur au site et de retour
    au testeur en passant par l'évaluation
  **/
  get data(){return this._data}
  set data(v){ this._data = v}

  get isSuccess(){return this.data.success }
  get isFailure(){return this._isfailure || (this._isfailure = !this.isSuccess)}
  get isPending(){return this.data.pending}

  get inverse(){return this.data.inverse}

  /**
    La ligne de rapport à reproduire
  **/
  get reportLine(){
    return DCreate('DIV', {class:`report-line ${this.classResult}`, inner:this.message})
  }

  /**
    La classe CSS en fonction du résultat
  **/
  get classResult(){
    return this.isSuccess ? 'success' : (this.isPending ? 'pending' : 'failure')
  }

  /**
    Le message en fonction du résultat
  **/
  get message(){
    var propMessage = this.isSuccess ? 'success' : 'failure'
    this.inverse && (propMessage += 'Inverse')
    const messages = this.owner/*TCase*/.owner/**/[`${this.data.method}Messages`]()
    console.log("Messages : ", messages)
    return messages[propMessage]
  }

  get successMessage(){ return this._successmessage}
  set successMessage(v){ this._successmessage = v}
  get failureMessage(){ return this._failuremessage}
  set failureMessage(v){ this._failuremessage = v}
  get successMessageInverse(){ return this._successmessageInverse}
  set successMessageInverse(v){ this._successmessageInverse = v}
  get failureMessageInverse(){ return this._failuremessageInverse}
  set failureMessageInverse(v){ this._failuremessageInverse = v}

  get pendingMessage(){
    return "Message pending non encore défini."
  }
}
