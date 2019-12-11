# Website-Testor<br>Manuel d'utilisation

[TOC]

## Test du contenu de la page

La méthode principale est `hasCss` (et son inverse `hasNotCss`). Elle s’utilise sur `site` de cette manière :

~~~javascript
site.hasCss(selector[, arguments])
~~~



Par exemple :

~~~javas
site.hasCss('section#page-contents')
# succès si la page contient <section id="page-contents">...</section>
~~~

~~~javas
site.hasCss('div', {text: "Mon texte", onlyOnFailure:true})
# Ne produit rien si la page contient <div>Mon texte</div> mais produit un échec visible
# dans le cas contraire.
~~~

