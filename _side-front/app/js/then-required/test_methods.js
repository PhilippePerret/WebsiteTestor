'use strict'
/** ---------------------------------------------------------------------
  *   Méthodes de tests

  Sont définies ici toutes les méthodes qu'on peut trouver dans les
  tests.

*** --------------------------------------------------------------------- */
function it(description, options){
  return new SWTWriteReport('it', description, options)
}

function site(options){
  return new SiteSubject(options)
}

// Raccourci
function visit(route, options){
  return site(options).visit(route, options)
}

function tag(selector){
  return new Tag(selector)
}

function click(selector){
  return new Tag(selector).click() // le return n'est pas obligatoire ici
}
