const App = {
  async init(){
    UI.init()
    // Appeler la méthode 'onInit' si elle existe
    if ( this.onInit instanceof Function ) {
      this.onInit.call(this)
    }
  }
}
Object.defineProperties(App,{

  // Le dossier $HOME de l'utilisateur courant
  homeDirectory:{get(){
    if (undefined === this._homedirectory){
      this._homedirectory = require('os').homedir();
    }return this._homedirectory
  }}

})
