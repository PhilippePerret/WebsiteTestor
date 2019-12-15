'use strict'


/**
  Définition des configurations (options) de l'application
**/
const APP_DATA_CONFIG = {
  failFast:{
      hname: "S'arrête à la première erreur"
    , type: 'boolean'
    , value: true
  }
}

if ('undefined' == typeof(window.DATA_MINI_AIDE)){window.DATA_MINI_AIDE = {}}
Object.assign(DATA_MINI_AIDE,{
  failFast: {
      title:'Interruption de première erreur'
    , content:"Mettre cette valeur à true si on veut que le testeur s'arrête à la première erreur"
  }

})
