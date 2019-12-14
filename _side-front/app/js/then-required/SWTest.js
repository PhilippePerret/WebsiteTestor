'use strict'
/** ---------------------------------------------------------------------
  *   Classe SWTest
  *   -------------
  *   Gestion des tests (feuilles de tests particulièrement)
*** --------------------------------------------------------------------- */
class SWTest {

  static init(){
    this.items = []
    this.itemsById = {}
    this.lastId = 0
  }

  /**
    Retourne la feuille de test d'identifiant +id+
  **/
  static get(id){return this.itemsById[id]}

  static add(item){
    this.items || this.init()
    item.id = this.newId()
    this.items.push(item)
    Object.assign(this.itemsById,{[item.id]: item})
  }

  /**
    Retourne un nouvelle identifiant pour une feuille de tests
  **/
  static newId(){
    return ++ this.lastId
  }

  static get current(){ return this._current }
  static set current(v){this._current = v}

  constructor(testor, path){
    this.testor = testor
    this.path   = path
    this.cases  = []
    this.constructor.add(this)
  }

  /**
    Lancer la feuille de tests en question
  **/
  run(){
    console.log("-> SWTest#run")
    // TODO Une introduction  dans le rapport, permettant de dire d'où on vient
    // le temps, etc.
    this.runNextCase()
  }

  runNextCase(){
    console.log("-> SWTest#runNextCase")
    this.tcase = this.cases.shift()
    if ( this.tcase ) {
      // <= Il y a encore un cas
      // => On joue le cas
      this.tcase.run()
    } else {
      console.log("TEST TERMINÉ !")
    }
  }

  afterRunCase(data){
    console.log('-> SWTest#afterRunCase')
    this.tcase.evaluate(data)
    this.runNextCase()
  }


  /**
    Ajout du {TCase} +tcase+ à la feuille de tests
  **/
  addCase(tcase){
    this.cases.push(tcase)
  }
}