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
    return ++ this.lastId
  }

  /**
    Ajouter le TCase +case+ à la liste des TCases
  **/
  static add(tcase){
    Object.assign(this.items, {[tcase.id]: tcase})
  }

  /**
    Réinitialiser les tcases
  **/
  static reset(){
    this.lastId = 0
    this.items = {}
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

    // Pour récupérer le numéro de ligne de ce TCase
    try {throw new Error("Juste pour avoir la ligne")}
    catch (e) {this.getCaseLineFromStack(e.stack)}

  }

  /**
    Récupère le numéro de la ligne (et de colonne) du case
  **/
  getCaseLineFromStack(stack){
    const stackLines  = stack.split("\n")
        , nblines     = stackLines.length
    for(var iline = 0; iline < nblines; ++iline){
      const line = stackLines[iline]
      if (line.match(this.swtest.path)){
        // console.log("Ligne qui matche : ", line)
        var dline = line.split(this.swtest.path)[1].split(':')
        this.lineNumber   = Number(dline[1])
        this.columnNumber = Number(dline[2])
        break
      }
    }
    // console.log("Ligne du case : ", this.lineNumber)
  }

  /**
    On joue ce cas.
  **/
  run(){
    console.log("-> <TCase #%d>.run", this.id, this.code)
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
    this.expectation.execute()
    this.swtest.runNextCase()
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
      , type:     this.type
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
