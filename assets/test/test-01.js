Site.open('http://localhost/AlwaysData/Icare_AD_2018/')
.then(()=> {
  site.hasCss('section#page-contents')
  site.hasCss('section#header')

  site.click('a#signup-button')

  site.hasCss('section#header')
  site.hasCss('form#signup-form')

  // site.fill('form#signup-form',{
  //     'mail': "monmail@yahoo.fr"
  //   , 'pseudo': "MonPseudo"
  // })
})
