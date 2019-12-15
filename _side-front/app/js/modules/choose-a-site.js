'use strict'

/**
  Méthode pour choisir un site

  Elle doit retourner une liste avec :
    [
      url du site, // ou null
      path du dossier // local ou distant
    ]
**/
class ChooserSite {
  constructor(){

  }
  choose(){
    return new Promise((ok,ko)=>{
      this.show()
      this.onEnd    = ok
      this.onError  = ko
    })
  }
  show(){
    document.body.appendChild(this.build())
    this.div = DGet('#site-chooser')
    this.observe()
  }
  remove(){
    this.div.remove()
  }
  observe(){
    DGet('#chooser-site-btn-cancel', this.div).addEventListener('click', this.onCancel.bind(this))
    DGet('#chooser-site-btn-load', this.div).addEventListener('click', this.onCharge.bind(this))
    DGet('#chooser-site-btn-choose-folder', this.div).addEventListener('click',this.chooseFolder.bind(this))
  }
  async chooseFolder(){
    var res = await chooseFolder({message:"Dossier local du site :"})
    // console.log("res : ", res)
    if ( res ) {
      DGet('#chooser-site-path').value = res
      // Si l'URL n'est pas définie, on la déduit du path
      var regSite =  regSite || new RegExp(path.join(App.homeDirectory,'Sites'))
      DGet('#chooser-site-url').value = 'http://localhost/' + res.replace(regSite,'')
    }
  }
  onCharge(){
    console.log("-> onCharge")
    console.log("(this.url, this.path)", this.url, this.path)
    this.onEnd({siteUrl:this.url, sitePath:this.path})
    this.remove()
  }
  onCancel(){
    console.log("-> onCancel")
    this.onEnd({siteUrl:null, sitePath:null})
    this.remove()
  }
  build(){
    var divTitre = DCreate('DIV',{
        style:'font-weigth:bold;font-family:Arial;font-size:16.2pt;'
      , inner:"Site à tester"
    })
    var divUrl = DCreate('DIV',{id:'div-site-chooser-url', style:"margin-top:1em;", inner:[
      DCreate('input',{type:'text',id:'chooser-site-url',placeholder:"http://url/du/site.net",style:"width:380px;font-size:inherit;"})
    ]})
    var divSitePath = DCreate('DIV',{id:'div-site-chooser-path', style:"margin-top:0.5em;", inner:[
        DCreate('input',{type:'text',id:'chooser-site-path',placeholder:"(à partir du dossier Sites)",style:"width:320px;font-size:inherit;"})
      , DCreate('button',{type:'button',id:'chooser-site-btn-choose-folder', inner:"Choisir…"})
    ]})
    var divButtons = DCreate('DIV',{style:"text-align:right;margin-top:1em;", inner:[
        DCreate('button',{type:'button',id:'chooser-site-btn-cancel', inner:"Renoncer", style:"font-size:inherit;float:left;"})
      , DCreate('button',{type:'button',id:'chooser-site-btn-load',inner:"  OK  ", style:"font-size:inherit;"})
      ]})
    return DCreate('DIV', {
      id:'site-chooser'
    , style:"position:fixed;background:white;padding:1em 2em 2em;top:0;left:10px;width:400px;z-index:100;border:1px;border-radius:0;box-shadow:10px 10px 10px #AAA;"
    , inner:[
        divTitre, divSitePath, divUrl, divButtons
    ]})
  }

  get url(){
    return this._url || (this._url = nullIfEmpty(DGet('#chooser-site-url',this.div).value))
  }
  get path(){
    return this._path || (this._path = nullIfEmpty(DGet('#chooser-site-path',this.div).value))
  }
}
const ChooseASite = function(){
  var url, sitewebPath
  const chooser = new ChooserSite()
  chooser.choose().then(SWTestor.open.bind(SWTestor)).catch(App.onError)
}

module.exports = ChooseASite
