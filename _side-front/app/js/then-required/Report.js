'use strict'
/** ---------------------------------------------------------------------
  *
  *   Classe SWTReport
  *   ----------------
  *   Gestion des rapports - un testor possède une propriété report qui
  *   est une instance de cette classe.
  *
*** --------------------------------------------------------------------- */
class SWTReport {

  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(testor) {
    this.testor = testor
  }

  /**
    Pour écrire la ligne +msg+ dans le rapport, avec les options +options

    param {Object} options
                    withTime: false (défaut) si true, on ajoute le temps en
                              incise.
  **/
  write(msg, type, options){
    this.rapport.appendChild(this.buildMessage(msg, type, options))
  }

  /**
    Pour initialiser le rapport
  **/
  reset(){
    this.rapport.innerHTML = ''
  }

  buildMessage(msg, type, options){
    var css = ['report-line', type /* p.e. 'success' */]
    options = options || {}
    options.withTime && (msg = `${now()} -- ${msg}`)
    options.raw || (msg = `--- ${msg}`)
    if ( options.before ) msg = `${options.before.replace(/\r?\n/g,'<br>')}${msg}`
    if ( options.after )  msg = `${msg}${options.after.replace(/\r?\n/g,'<br>')}`
    options.raw || (msg = msg.replace(/\r?\n/g,'<br>'))
    return DCreate('DIV', {class:css.join(' '), inner:msg, style:options.style})
  }


  get rapport(){
    return this._obj || (this._obj = DGet('#report'))
  }
}
