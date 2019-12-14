'use strict'
/** ---------------------------------------------------------------------
  *   Méthodes de tests

  Sont définies ici toutes les méthodes qu'on peut trouver dans les
  tests.

*** --------------------------------------------------------------------- */



function tag(selector){
  return new Tag(selector)
}

function click(selector){
  return new Tag(selector).click() // le return n'est pas obligatoire ici
}

function fill(selector){
  var tag = new Tag(selector)
  tag.method = 'fill'
  return tag
}
