'use strict'
/** ---------------------------------------------------------------------
  *
  * Class TestCode
  * --------------
  * Gestion du textarea qui contient le code
  *
*** --------------------------------------------------------------------- */
class TestCode {
  static init(){
    this.onKeyPress = this.onKeyPress.bind(this)
    this.observe()
  }
  static observe(){
    this.obj.addEventListener('keypress', this.onKeyPress)
  }
  static onKeyPress(ev){
    // console.log("-> onKeyPress", ev, ev.key, ev.altKey)
    if (ev.key == 'Enter' && ev.altKey) {
      new TestCode().evaluate()
      // TODO 2valuation du code
      return stopEvent(ev)
    }
  }

  static get obj(){
    return DGet('textarea#code')
  }

  constructor(){

  }

  /**
    Méthode qui permet d'évaluer le code
  **/
  evaluate(){
    console.log("Code à évaluer\n", this.lines)

  }

  get lines(){
    return this._lines || (this._lines = this.code.split(/\r?\n/))
  }
  get code(){
    return this._code || (this._code = this.constructor.obj.value)
  }
}
