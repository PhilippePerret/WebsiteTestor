'use strict'
/** ---------------------------------------------------------------------
  *   Classe SiteSubject
  *   ------------------
  *   Le site en tant que site

Par exemple pour la commande 'visit'
*** --------------------------------------------------------------------- */
class SiteSubject extends SWTSubject {

  constructor(options) {
    super()
    this.context = 'Site'
  }

  /**
    Pour visiter une route en particulier
    Note : on peut utiliser soit `site().visit(route)` soit le
    raccourci `visit(route)`
  **/
  visit(route, options){
    var type = 'operation'
    var tcase = new TCase(this,type,'visit')
    tcase.set({
      route: route
    , options: options
    })
    return this // chainage
  }
  visitMessage(){
    return {}
  }
  visitEvaluate(){
    
  }


}
