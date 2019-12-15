'use strict'

/**
  |
  | Exécute un script JS sur le renderer
  |
  | mainW doit avoir été défini dans app.js, comme constante globale, et
  | c'est la fenêtre ouverte.
**/
function execJS(methodAndArgs){
  mainWindow.webContents.executeJavaScript(methodAndArgs)
}

const ObjMenus = {

  get data_menus(){
    return [
      {
        label: 'SiteWeb'
      , enabled: true
      , submenu: [
          {
              label: 'Ouvrir…'
            , id: 'choose-website'
            , accelerator: 'CmdOrCtrl+O'
            , enabled: true
            // , click:function(){execJS("PTexte.chooseTexte.call(PTexte)")}
          }
        , { type:'separator' }
        , { type:'separator' }
        , { role: 'quit' }
        ]
      }
    , {
        label: 'Édition'
      , enabled: true
      , submenu: [
            {role:'cancel', label:'Annuler'}
          , {rold:'redo', label:'Refaire'}
          , {type: 'separator'}
          , {role:'selectAll', label:'Tout sélectionner'}
          , {type: 'separator'}
          , {role:'copy', label:'Copier'}
          , {role:'cut', label:'Couper'}
          , {role:'paste', label:'Coller'}
        ]
      }
    , {
        label: 'Test'
      , enabled: true
      , id: 'menu-test'
      , submenu: [
          {
              label:  'Configuration…'
            , id:     'test-configuration'
            , accelerator: 'CmdOrCtrl+Shift+;'
            , enabled:true// TODO à régler
            , click: function(){
                execJS('SWTestor.current.config.edit.call(SWTestor.current.config)')
              }
          }
        , {type:'separator'}
        , {
              label: 'Lancer les tests…'
            , id:     'test-run'
            , accelerator: 'CmdOrCtrl+Shift+A'
            , enabled: true // Plus tard, dépendra de présence de texte ou non
            , click:function(){
                execJS("SWTestor.current.rerun.call(SWTestor.current)")
              }
          }
        , {type:'separator'}
        ]
      }
    , {
        label: 'Outils'
      , enabled: true
      , submenu: [
          {
              label: 'Recharger l’application'
            , accelerator: 'CmdOrCtrl+R'
            , click: () => {mainWindow.reload()}
          }
          , {type:'separator'}
          , {label: 'Console web', role:'toggleDevTools'}
        ]
      }

    ]
  }
}

module.exports = ObjMenus
