'use strict'


/**
  Définition des configurations (options) de l'application
**/
const APP_DATA_CONFIG = {
  fullReport:{
      hname: 'Rapport complet'
    , type:'boolean'
    , value: true
  }
, failFast:{
      hname: "S'arrête à la première erreur"
    , type: 'boolean'
    , value: true
  }
, showFileTestPath:{
      hname: "Affichage du chemin du test"
    , type: 'boolean'
    , value: true
  }
, folder:{
      hname: "Dossier local"
    , type: 'string'
    , value: null
  }
, url_offline:{
      hname: "URL locale"
    , type: 'string'
    , value: null
  }
, url_online:{
      hname: "URL distante"
    , type: 'string'
    , value: null
  }

}

if ('undefined' == typeof(window.DATA_MINI_AIDE)){window.DATA_MINI_AIDE = {}}
Object.assign(DATA_MINI_AIDE,{
  fullReport:{
      title: 'Rapport complet'
    , content:"Pour afficher un rapport complet à la fin des tests"
  }
,  failFast: {
    title:'Interruption de première erreur'
  , content:"Mettre cette valeur à true si on veut que le testeur s'arrête à la première erreur"
  }
, showFileTestPath:{
    title:'Affichage du chemin'
  , content: "Si cette option est activée, le chemin relatif au fichier test est affiché dans le rapport de test."
, folder:{
    title:'Dossier local'
  , content: "Dossier local contenant le site"
  }
, url_offline:{
    title:'URL locale'
  , content: "URL à utiliser pour regagner le site local."
  }
, url_online:{
    title:'URL distante'
  , content: "URL à utiliser pour regagner le site distant, sur internet."
  }
}

})
