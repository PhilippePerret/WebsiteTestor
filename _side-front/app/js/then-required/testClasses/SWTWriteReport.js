'use strict'
/** ---------------------------------------------------------------------
  *   Classe SWTIt
  *   ------------
  *   Juste pour mettre des titres d'opération
  *
*** --------------------------------------------------------------------- */
class SWTWriteReport extends SWTSubject {
  constructor(typeReport, description, options){
    super()
    this.type = 'operation'
    this.context = 'Report'
    this.reportType = typeReport
    this.description = description
    this.options = options
    this.show()
  }
  /**
    Méthode auto-appelée à l'instanciation, pour écrire le cas au
    moment voulu
  **/
  show(){
    var tcase = new TCase(this,'operation','show')
    tcase.set({
        description:this.description
      , options: this.options
      , reportType: this.reportType
    })
  }
  showEvaluate(data){
    testor.report(this.description,this.reportType,{raw:true})
  }
}
