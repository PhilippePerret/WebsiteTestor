'use strict'
/** ---------------------------------------------------------------------
  *   Méthodes de tests

  Sont définies ici toutes les méthodes qu'on peut trouver dans les
  tests.

*** --------------------------------------------------------------------- */

function visit(route, options) {

}

function tag(selector){
  return new Tag(selector)
}

function click(selector){
  return new Tag(selector).click() // le return n'est pas obligatoire ici
}
