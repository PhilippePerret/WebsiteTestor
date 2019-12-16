# Website-Testor<br>Manuel d'utilisation

[TOC]

## Inspection du code HTML du site

À cause de l’utilisation de l’iframe, on ne peut pas utiliser la console de développement pour inspecter le code du site. Pour palier cette limitation, on utilise l’item de menu «  Site > Inspecter le code… » (ou le raccourci clavier `Cmd+Alt+C`).

Cela place le code du site dans un nouvel espace, et l’on peut utiliser l’outil d’inspection normal.

Pour fermer cette visualisation du site, cliquez simplement sur la fenêtre.

## Feuilles de tests

Les feuilles de tests doivent se trouve dans le dossier `swtTests` à la racine du site à tester.

## Rédaction des feuilles de tests

Toute la suite de ce manuel définit comment il faut rédiger les feuilles de tests.

On trouvera un liste de toutes les méthodes en [annexe](#annexesmethodes).

## Le cas de `it`

Il est tout à fait possible d’utiliser des `it` dans les feuilles de tests, mais ils n’ont absolument pas la même fonction que dans les autres testeurs (rspec, etc.). Ici, ils servent simplement, pour le moment, à « titrer » les tests et s’utilisent comme les autres cas, en une simple ligne. Par exemple :

~~~javascript
it("Identification d'un utilisateur")
visit("user/login")
tag('a[href="logout"]').not.exists()
tag('form#login-form').fillWith({...}).andSubmit()
tag('a[href="logout"]').exists()
tag('div.notice').contains("Bienvenue !")
~~~



> Note : dans un avenir plus ou moins proche, il sera possible de coloriser différemment le message de ce `it` en fonction de la réussite ou de l’échec du cas.

## Définition de la route à tester (url)

Pour définir une route en particulier, on utilise :

~~~javascript
visit('<route>')
~~~

Par défaut, un test utile comme route `"/"`, c’est-à-dire l’index de la page d’accueil du site :

~~~javascript
visit("/")
~~~

Cette route est implicite et n’a pas besoin d’être indiquée en début de test s’il commence par la page par défaut (souvent la page d’accueil).

## Interaction et test du contenu de la page

Le sujet de base de l’interaction avec le contenu de la page est l’objet `tag` qu’on définit avec son sélecteur :

~~~javascript
tag("div#monDiv")
~~~

### Présence ou non de l'élément

On peut en tester l’existence grâce à l'expectation :

~~~javascript
tag("div#mondiv").exists()
~~~

Si on préfère que ce soit une *vérification* plutôt qu’une *expectation* (note : une *vérification* ne produira un résultat que si l’attente n’est pas remplie, c’est-à-dire, ici, si l’élément n’existe pas) :

~~~javascript
tag("div#mondiv").exists({checkOnly:true})
~~~

Pour tester la non existence :

~~~javascript
tag("#mondiv").not.exists()
~~~





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



## Formulaires

### Remplissage et soumission d’un formulaire

~~~javascript
tag("form#monForm").fillWith(values).andSubmit()
~~~

`values` est une table avec en clé soit le `name` soit l’`id` de l’élément et en valeur la valeur à lui donner. La valeur sera différente en fonction du type d’élément. Pour un checkbox par exemple, la valeur `true` signifiera qu’il faut cocher la case.

Si le formulaire possède un autre bouton qu’un bouton `input#submit` pour être soumis, on peut en indiquer le sélecteur en options de `andSubmit` :

~~~javascript
tag("form#monform").fillWith(values).andSubmit({button:"button#submit-button"})
~~~



## Annexe

<a name=" annexesmethodes"></a>

### Liste des sujets et méthodes

### Méthodes raccourcies

##### `visit("<route>"[,<options>])`

Description : Pour visiter la route `<route>`

Note : c’est un raccourci de la méthode `visit` de l’objet `Site`.



### OBJET `Site(options)`

Type : sujet (donc attend une méthode pour fonctionner)

Description : pour la gestion du site en tant qu’instance de navigation

#### Méthodes

##### `site().visit("<route>"[, <options>])`

Exemple : `visit("user/login")`

Options : {online: true}

Exemples :

~~~javascript
site().visit("/")
// => page d'accueil

visit("")
// => page d'accueil

site({online:true}).visit("user/login")
// => page d'identification
~~~



#### OBJET `tag("<selector>")`

Type : sujet (donc attend une méthode pour fonctionner)

Description : un élément DOM de la page.

#### Méthodes

##### `tag(<selector>).exists([<options>])`

type : expectation (sauf si `option.checkOnly` = `true`)

description : produit un succès si l’élément `<selector>` est trouvé dans la page.

Inversable : oui (`not.exists`)

##### `tag(<selector>).contains("<contenu>"[, <options>])`

Type : expectation (sauf si `options.checkOnly` est true)

Description : produit un succès si l’élément DOM contient `"<contenu> »` (qui peut être une balise).

Inversable : oui (`not.contains`

Exemple :

```javascript
tag("div#monDiv").contains("Ce texte", {checkOnly: true})
// => Ne produit qu'un échec si l'élément div#monDiv ne contient pas "Ce texte"

tag("#autreDiv").not.contains("pas ce texte")
// => Produit un succès si l'élément #autreDiv ne contient pas "pas ce texte"
```

##### `tag(<selector>).click([<options>])`

Type : opération

Description : produit un click sur un lien, un bouton, etc.

Inversable : non

Exemple :

~~~javascript
tag("button#monBouton").click()

tab("a#logout").click({failure:"Impossible d'activer le bouton de déconnexion"})
// En cas d'échec (absence du bouton par exemple), l'opération produit une
// failure avec le message indiqué (auquel sera ajouté les détails de l'impossibilité)
~~~

Note : avant d’être activée, la méthode vérifie et attend l’existence de l’élément. Il est donc inutile de tester sa présence avant.

#### `tag(<selector>).fillWith(<values>).andSubmit([<options>])`

Type : opération

Description : permet de remplir un formulaire avec les valeurs transmises et de le soumettre.

En cas d’échec : une failure est produite, avec les raisons de l’échec, auxquelles sera ajouté l’éventuel message `options.failure`.

Valeurs : les `<values>` sont une table avec en clé les identifiants des champs de formulaire ou les attributs `name`. Pour certains champs, comme les `select`, ça peut être aussi les titres des balises `options`.

Exemples :

~~~javascript
tab("form#login-form").fillWith({login_mail:"...", login_pwd:"..."}).andSubmit()
// Ici, login_mail et login_pwd sont les ID des input de type text du formulaire

tab("form#monFormulaire").submit()
// => Pour soumettre simplement 
~~~

