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
  constructor( tcase ){
    this.tcase = tcase
  }

  /**
    On exécute l'expactation, c'est-à-dire principalement :
      - on écrit le rapport
      - on incrémente le nombre de succès ou d'échec
  **/
  execute(){
    if ( this.isSuccess ) {
      ++ testor.successCount
    } else if ( this.isFailure ) {
      ++ testor.failureCount
    } else {
      ++ testor.pendingCount
    }
    this.writeShortReport()
  }
  /**
    Écriture du rapport court
  **/
  writeShortReport(){
    testor.report(this.message, this.classResult)
  }

  /**
    Les données qui ont fait l'aller-retour du testeur au site et de retour
    au testeur en passant par l'évaluation
  **/
  get data(){return this._data}
  set data(v){ this._data = v}

  get isSuccess(){return this.data.success }
  get isFailure(){return this._isfailure || (this._isfailure = !(this.isPending||this.isSuccess))}
  get isPending(){return this.data.pending}

  get inverse(){return this.data.inverse}

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
    if ( this.isPending ) {
      return this.data.pending || "Pending"
    } else {
      var propMessage = this.isSuccess ? 'success' : 'failure'
      this.inverse && (propMessage += 'Inverse')
      var msg = this.tcase/*TCase*/.owner/**/[`${this.data.method}Messages`](this.data)[propMessage]
      this.data.testError && (msg += ` (${this.data.testError})`)
      msg += `<div class="small right">[${this.tcase.swtest.relativePath} l.${this.tcase.lineNumber}]</div>`
      return msg
    }
  }
}
