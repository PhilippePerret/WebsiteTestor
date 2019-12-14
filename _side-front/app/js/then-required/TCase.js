'use strict'
/** ---------------------------------------------------------------------
  *
  * Class TCase
  * -----------
  * Pour la gestion des cases.
  *

De manière générale, un {TCase} correspond à une ligne d'une feuille de
test, il correspond à une étude de cas particulière.
*** --------------------------------------------------------------------- */
class TCase {

  /** ---------------------------------------------------------------------
    *
    * CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
    Retourne le TCase d'identifiant +id+
  **/
  static get(id){ return this.items[id] }

  /**
    Retourne un nouvel identifiant pour TCase
  **/
  static newId(){
    this.lastId || (this.lastId = 0)
    return ++ this.lastId
  }

  /**
    Ajouter le TCase +case+ à la liste des TCases
  **/
  static add(tcase){
    this.items || (this.items = {})
    Object.assign(this.items, {[tcase.id]: tcase})
  }

  /** ---------------------------------------------------------------------
    *
    * INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(owner, type, method){
    this.owner    = owner // par exemple une {Tag}
    this.id       = this.constructor.newId()
    this.type     = type // 'operation','expectation' ou 'verification'
    this.context  = owner.context // p.e. 'dom' ou 'db'
    this.swtest   = SWTest.current // forcément le courant, à l'instanciation
    this.testor   = this.swtest.testor
    this.method   = method // p.e. 'contains'. Permet d'évalue le cas.
    // Dès qu'on instancie un TCase, on l'enregistre dans la pile
    // d'exécution du test.
    SWTest.current.addCase(this)
    // On l'ajoute à la liste des éléments de son constructeur, pour pouvoir
    // l'appeler avec TCase.get(<id>)
    this.constructor.add(this)

  }

  /**
    On joue ce cas.
  **/
  run(){
    console.log("-> <TCase #%d>.run", this.id)
    this.testor.sendToSite(Object.assign(this.code))
  }

  /**
    Méthode appelée une fois que le case a été interprêté côté
    site. C'est ici que va pouvoir se faire l'évaluation.
  **/
  afterRun(data){
    console.log("-> <TCase #%d>.afterRun", this.id)
    this.owner.evaluate(data) // modifie data
    this.expectation.data = data
    // On demande l'écriture du rapport court
    this.expectation.writeShortReport()
  }

  /**
    Définition supplémentaire des données en fonction de l'opération
    On doit l'utiliser après l'instanciation du TCase pour envoyer les
    informations qui caractérisent l'exécution. Par exemple le subject pour
    un tag.
  **/
  set(data){
    this.ownData = data
  }
  /**
    La table de données qu'il faut transmettre au site (à l'interface) pour
    être exécuté.
  **/
  get code(){
    var c = {
        id:       this.id
      , swtest:   this.swtest.id
      , context:  this.context
      , method:   this.method
    }
    Object.assign(c, this.ownData || {})
    return c
  }

  get expectation(){
    return this._expectation || (this._expectation = new Expectation(this))
  }

}
