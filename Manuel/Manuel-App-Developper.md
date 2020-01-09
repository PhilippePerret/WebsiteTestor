# Website-testor<br>Manuel du développeur

[TOC]

## Introduction

Ce manuel se destine au développeur du WebsiteTestor. Pour l'utilisation du testeur de site (pour tester un site par exemple), utiliser le manuel de l'application (`Manuel-application.md`)

## À faire

## Communication entre testeur et site

La méthode `<SWTestor>#sendToSite` envoie un message (un `{object} dataMessage`) à l’interface du site testé, message reçu par `<Interface>#receiveFromTestor(dataMessage)`. L’interface produit une opération sur le site puis utilise sa méthode `<Interface>#sendToTestor(dataMessage)` pour appeler, côté testeur, la méthode`<SWTInterface>#onMessage(dataMessage)` qui traite le retour (en règle général, ça consiste à jouer la suite du *case* étudié ).

Si `dataMessage` définit la propriété `returnMethod`, c’est cette méthode qui sera appelée au retour dans  `<SWTInterface>#onMessage(dataMessage)`.

## Schéma général de communication

Ce schéma général permet de contourner la « politique de même origine » (« same origin policy ») qui empêcherait de commander le site par l’application de test. Pour la contourner, on utilise une interface copiée directement sur le site qui sera en mesure de contrôler le site.

On utilise pour ce faire `postMessage` et l’évènement `message`. Le plus simple serait de préparer une feuille javascript contenant tout le code nécessaire pour automatiser le site et de le charger dans le site lui-même.

Mais je préfèrerais travailler avec une interface qui permettrait de ne rien toucher au site original.

~~~
         |     Même origine      |
         |-----------------------|
SWT(*) --|-> Interface --> Site  |       (*)"SWT" pour "SiteWeb-Testor"
         |                  √	   |
SWT   <--|-  Interface <-- Site  |
         |-----------------------|
~~~



La fenêtre de l’application contient une `iframe` (`#interface`) qui charge l’interface (copié dans `<site-web>/siteweb-testor-api/main.html`). Le fichier `main.html` contient une `iframe` (`#site`) qui charge le site dont l’index doit se trouver à la racine de `<site-web>`.

Pour passer un message à l’interface, l’application de test utilise :

~~~javascript
const interFace = document.getElementById('interface')
interFace.postMessage({"mes":"Données"}, '*')
~~~



L’interface (iframe principal de la fenêtre de l’application) reçoit les données avec :

~~~javascript
window.addEventListener('message', sent => {
  var data = sent.data # => {"mes":"Données"}
  // Traitement (par exemple click, remplissage de formulaire, récupération de contenu)
})
~~~



L’interface commande le site (qui se trouve dans un de ses iframes) à l’aide de :

~~~javascript
document.getElementById('site').contentWindow[quelque chose]
// Par exemple pour obtenir le contenu d'un élément :
var contenu = document.getElementById('site')
                .contentWindow.document.querySelector('a#monlien').innerHTML
~~~



L’interface renvoie le résultat à l’aide de :

~~~javascript
window.parent.postMessage({"Contenu a#monlien": contenu},'*')
~~~



Et l’application de test le reçoit à l’aide de :

~~~javascript
window.addEventListener('message', retour => {
  var data = retour.data // => {"Contenu a#monlien": "Le lien"}
})
~~~



Et il peut l’évaluer.

## Parcours d’une ligne de test

Une « ligne de test » est une ligne qu’on trouve dans une feuille de tests.

Nous suivons ici le « parcours » de quelques lignes.

Le testeur trouve cette ligne dans la feuille de style

`tag("div#mondiv").contains("Mon texte", {online:true})`

 Elle va la mettre dans la *pile d’exécution* de l’instance de la feuille de tests en suivant ce parcours :

- `tag(...)` crée une nouvelle instance `Tag` pour un objet DOM (ici, le div `#mondiv`)
- on appelle la méthode `exists` de cette instance
- la méthode `exists` crée un nouveau `TCase` qui est ajouté à la pile d’exécution du SWTest en définissant précisément ses propriétés (id:`<id du TCase>`, context:`"Dom"`, type:'expectation', inverse:false, eval: code à évaluer, expected: true, etc.).

Quand la feuille de tests a été complètement lue, chaque `TCase` de sa *pile d’exécutions* (ses « cases » ) sont exécutés les uns après les autres, successivement, même s’ils sont asynchrone : on attend toujours la fin de l’exécution d’un TCase pour lancer le suivant.

Noter que les données qui seront transmises feront tout le « tour » de l’exécution, en s’alimentant des opérations exécutées.

En l’occurrence, les data du TCase de notre ligne sont envoyé à l’interface site-side (interface côté site, de nom `InterfaceXXX.js`.

* la méthode `<interface>.receiveFromTestor(...)` reçoit les données du TCase
* Si ces données définissent un `waitFor`, on doit attendre la présence de cet élément pour lancer l’exécution. En l’occcurrence, il est défini pour la méthode `contains`, il faut attendre que le sélecteur soit présent dans la page.
* la méthode attend que `div#mondiv` se trouve dans la page
* quand c’est le cas, il évalue le code transmis dans la propriété `eval` par le TCase. En l’occurrence, c’est le code `document.querySelector("div#mondiv").innerHTML` et met le résultat dans la propriété `result` et `evalResult` des data du TCase.
* si le div n’a pas été trouvé, ou en cas d’une autre erreur, la propriété `testError` des datas est défini. Si c’est une erreur système, c’est la propriété `systemError` qui doit être définie.
* Une fois que c’est fait, `<interface>` se sert de la méthode `sendToTestor` pour renvoyer les données au *Testor*.

Les choses se passent ensuite côté *Testor*.

* l’instance interface `SWTInterface` reçoit les données par sa méthode `onMessage(...)`

* elle récupère le `TCase` de la ligne en se servant de la propriété `id` des données retournées (rappel : les données — les `data` — font tout le « tour » des tests, partant du testor pour aller vers le site et revenant vers le testor avec les résultats obtenus),

* elle appelle la méthode `afterRun` du TCase en lui transmettant les données de l'exécution,

* la méthode `<tcase>.afterRun` appelle la méthode `evaluate` du sujet, ici, par exemple l’objet `Tag`. Note : la méthode `evaluate` est en fait une méthode de la classe abstrait `SWTSubject` qui va appeler dans l’objet une méthode propre dont le nom est construit à partir du nom de la méthode (`exists` ici) et le suffixe `Evaluate` et seulement si le type de l’opération est `expectation`.

* Note : la méthode abstraite `SWTSubject.evaluate` traite le cas où `data.systemError` est définie et donc où une erreur système a été rencontrée avec ce cas.

* la méthode de l’objet principal, `Tag.existsEvaluate`, évalue le résultat en fonction des données envoyées. Ici, par exemple, c’est la méthode `exists`, il faut voir si `inverse` est vrai dans les propriéts et produire le résultat en fonction de `result`. Ici, `result` est le résultat de l’évaluation de `!!document.queryQuery("div#mondiv")` donc a été mis à `true` si l’élément a été trouvé dans la page.

  >  Note : en fait, chaque méthode d’objet (par exemple `exists`) fonctionne sur la base de trois méthodes :
  > * `<method>` qui est la méthode qui est appelée par la feuille de test, sur l’objet,
  > * `<method>Messages` qui retourne les quatre messages possibles, `success`, `failure`, `successInverse` et `failureInverse` qui serviront pour le rapport,
  > * `<method>Evaluate(data)` qui permet d’évaluer le résultat obtenu côté site et, notamment, définit la valeur de `data.success`, true si c’est un succès (tenant compte de l’inversion possible par `not`).

  Donc, ici, on trouve les méthodes et propriétés `Tag.exists()`, `Tag.existsMessages(data)` et `Tag.existsEvaluate(data)`.

* la méthode `TCase.afterRun` définit les `data` de l’expectation qui lui est associée,

* puis elle demande l’affichage du rapport en « exécutant l’expectation », c’est-à-dire en appelant la méthode `Expectation#execute()` qui va incrémenter le nombre de succès, d’échecs ou de pending et appeler la méthode `Expectation#writeShortReport()` pour faire écrire le rapport.

* la méthode `<tcase>.expectation.writeShortReport()` écrit sa ligne `reportLine` dans l’interface. Les méthodes de la classe `Expectation` n’ont pas à être modifiées.

* Le Testor a ensuite plusieurs solutions :

  * si une erreur système est survenue, et que l’option `--fail-fast` est activée, il s'arrête
  * si une erreur système est survenue, sans option `—fail-fast`, il passe à la feuille de tests suivant,
  * pareil avec les erreurs de test
  * sinon, il passe normalement à la prochaine ligne de test, le prochain `TCase`, ou alors, si on était sur le dernier cas, on passe à la feuille de tests suivante, si c’était la dernière feuille, on passe à la fin.

### Détail des opérations avec les méthodes et objets fournis

> Je ne suis pas sûr que cette partie soit conforme à ce qui a été déterminé avec la partie précédente.

1. On demande l’ouverture d’un site avec `SWTestor.open(url, path)`

   `url` est l’URI entière pour atteindre le site local ou distant. Par exemple `http://localhost/monSite/`

   `path` est le chemin d’accès absolu au dossier du site, en local ou en distant (pour le moment, on ne gère que les sites locaux, donc il faut copier le dossier `siteweb-testor-api`sur le site.

2. La méthode `SWTestor.open` :

   1. crée une instance `SWTestor` et la met en instance courante (`SWTestor.current`),
   2. appelle la méthode `<testor>.prepareForTest` pour préparer le site pour les tests, c’est-à-dire, essentiellement, copie le dossier `./_side-front/SiteWebTestor-API/siteweb-testor-api/` sur le site local (par SSH) ou distant,
   3. appelle la méthode `<testor>.load` pour véritablement charger le site.

3. La méthode `<testor>.load` :

   1. instancie une instance `{SWTInterface}`qui permettra la communication entre le site web et le testeur `<testor>`,
   2. appelle la méthode `<interface>.src(…)` pour définir la source du site, et donc charger le site dans la fenêtre (i.e. dans l’`iframe` du `main.html` de l’interface).

4. Quand la page est prête (testée dans le `main.js` du dossier test sur le site) :

   1. l’instance `{Interface} <swtInterface>` côté site envoie un message à l’interface `{SWTInterface}` côté testeur pour lui dire que le site est prêt à être testé (`{'firstReady':true})` à l’aide la méthode `sendToTestor(<data>)`. Note : la méthode s’appelle « send Testor » mais c’est en fait à l’interface du testeur que sont envoyés tous les messages.
   2. `<swtInterface>` (côté site), en recevant le `firstReady = true`, dit au testeur qu’il peut commencer ses tests en appelant `<testor>.start()`.

5. `<testor>.start` lance les tests. Pour les essais, il envoie aussi un message à afficher par le site, à l’aide de sa méthode `<testor>.sendMessage(<msg>)`. Note : il peut utiliser la méthode `<testor>.send(<data>)` pour envoyer des données, et notamment avec la propriété `eval:` qui donne le code à évaluer côté site. Par exemple, `<testor>.send({eval:'alert("Salut le monde !")'})` provoquera l’affichage du message « Salut le monde ! » sur le site.

6. Voir la partie suivante pour le détail du lancement des tests.

## Description des éléments (classes) d’un test

### Les types de ligne de test

Les tests sont des feuilles de tests javascript qui contiennent une suite de procédures à exécuter. On peut trouver les types de lignes suivants.

* Les **expectations**,. Ce sont des attentes précises qui produisent un résultat (un succès ou un échec) . Elles sont évaluées en fonction d’informations recueillies (par exemple vérifier qu’un titre soit bien celui qu’on croit).
* Les **vérifications**. Ce sont aussi des attentes précises, mais elles ne produisent un résultat que lorsqu’elles échouent. Elles sont souvent utilisées en début de test, pour vérifier que la situation est conforme au test.
*  Les **opérations** qui ne font que performer une action sur la page, comme par exemple le remplissage et la soumission d’un formulaire, un click sur un lien ou un bouton. Elles peuvent produire aussi des résultat, si par exemple le bouton sur lequel on devait cliquer n’a pas été trouvé.

### Les sujets des lignes de test

Une ligne de test commence toujours par un sujet. C’est de ce sujet qu’on attend quelque chose. Par exemple, dans la ligne :

~~~javascript
tag("#mondiv").contains("ce texte")
~~~

… le sujet est `tag("#mondiv »)`. C’est un sujet de type `Tag`. qui hérite de la classe `SWTSubject`.

### Création d’un nouveau sujet de ligne de test

(comme par exemple `tag`).

Prenons l’exemple sur sujet `db` qui va permettre de travailler avec la base de données de l’application. Voici les étapes de sa création.

1. Trouver les 3 ou 4 lettres qui vont permettre de le créer, qu’on appellera *méthode de test* (par exemple `tag`, `file` ou `str`). Ici, nous choisissons `db`.

2. Le définir dans le fichier `./_side-front/app/js/then-required/test_methods.js` (dans les lignes suivantes, on ne précisera plus `./_side-front/app/js/`). Cela revient à définir sa `function`, très simplement. On sait déjà que le premier argument sera une requête base qu’il faudra évaluer, donc ici `query`.

   ~~~javascript
   const db = function(query){ return new SWTDb(query) }
   ~~~

3. Définir sa *classe sujet* (`SWTDb` ci-dessus) dans un nouveau fichier de nom `testClasses/Db.js` :

   ~~~javascript
   class SWTDb extends SWTSubject {
     constructor(query){
       super()
       this.query = query
       this.context = 'Db'
     }
   }
   ~~~

   Noter qu’un sujet doit toujours définir son contexte (`context`). C’est de cette manière que le site (l’interface-site) saura comment traiter le sujet. Pour `tag`, par exemple, le contexte est `Dom`. Le contexte doit commencer par une capitale.

4. Une fois qu’on a défini le contexte, on peut créer sa fonction de traitement du côté site, dans le fichier `./_side-front/SiteWebTesto-API/siteweb-testor-api/interface.js`. C’est une fonction qui portera le préfixe `treateData` et le contexte en suffixe. Donc, ici, on aura :

   ~~~javascript
   class Interface {
     //...
   	treateDataDb(data){

   	}
     // ...
   }
   ~~~

   C’est dans cette méthode qu’il faudra définir comment traiter les opérations, les requêtes, etc. Il faut bien penser ici qu’une interface est nécessaire pour savoir comment l’application (le site) traite ses requêtes (identifiants, base, traitement des requêtes). Il faut fournir à l’utilisateur du test la description de la construction de cette interface (ce sera étudié ci-dessous).

5. Il faut définir ensuite à quelles méthodes l’objet `db` (`{SWTDb}`) va réagir. On peut penser à :

   ~~~javascript
   SWTDb.DATABASE = "mabasededonnees"
   // Pour définir la base de données

   db("SELECT * FROM matable WHERE id = ?", [1]).contains({col1:"val1", col2: "val2"})
   // Expectation de contenu

   db("INSERT INTO matable ...", values).exec()
   // Opération pour mettre quelque chose

   db("SELECT * FROM matable LIMIT 10").exec()
   // Opération qui renvoie un résultat
   ~~~

   Toutes ces méthodes (`contains`, `exec`) vont devoir être implémentées dans la classe `SWTDb` qui va ressembler maintenant à :

   ~~~javascript
   class SWTDb extends SWTSubject {

     // Pour définir de façon global la base de données à utiliser
     static get DATABASE(){return this._database}
     static set DATABASE(v){this._database = v}

     constructor(query){
       super()
       this.query = query
       this.context = 'Db'
     }

     /*
     	Expectation de retour de la requête
     */
     contains(expected, options){
       const tcase = TCase(this, 'expectation', 'query')
       tcase.set({
   	      query: this.query
         , expected: expected
         , options: options
       })
     }

     /*
     	Opération
     */
     exec(options){
       const tcase = TCase(this, 'operation', 'query')
       tcase.set({
         	query: this.query
         , options: options
       })
     }
   }
   ~~~



6. **Interface pour l’utilisateur des tests**. Pour pouvoir être utilisable, il faut fournir à l’utilisateur des tests la description de l’interface à construire pour faire un « pont » entre le testeur et le site. Cette interface consiste en la création, sur le site, de la méthode `SWTDbQuery` qui doit recevoir en argument la base, la requête et les valeurs à traiter, et qui doit retourner le résultat renvoyé par la base, comme une liste de rangées :

   ~~~javascript
   function SWTDbQuery(base, query, values){
     return new Promise((ok,ko)=>{
       // ... ici les opérations pour envoyer la requête à la DB
       // ... et recevoir le résultat
       ok(retour)
     })
   }
   ~~~

   Pour le moment, on considère les conventions suivantes :

   * la base de donnée est MySQL,

   * les *données de configuration* se trouve sans dans le dossier `./data/secret/mysql.json` et contient une donnée contenant :

     ~~~javascript
     {
       "online":{
         "host": "hôte mysql distant",
         "username": "..."
         "password": "..."
       },

       "offline":{
         "host": "hôte mysql local",
         "username": "...",
         "password": "..."
       }
     }
     ~~~



## Lancement des tests

Voilà de façon générale comment les choses fonctionnent à partir de l’appel à `<testor>.start()`.

Rappel : il y a un seul `<testor>` pour une session de test. Ce testor se trouve dans `SWTestor.current`.

1. La méthode commence par relever la liste de tous les fichiers tests du dossier test du site. Ce dossier doit se trouver à la racine du site, avec pour nom `./swtests/`.
2. De chacun de ces fichiers, le Testor fabrique une instance `SWTest` qui sera considérée comme l’instance de la feuille de test. C’est cette instance qui, plus tard, va jouer chacun des cas empilés dans sa pile d’exécution. Cette instance est mise en instance courante (`SWTest.current`) pour la suite du traitement (pour que le require sache où envoyer les évaluations et les opérations).
3. Après avoir fabriqué l’instance `SWTest`, le Testor `require` le fichier, qui est du javascript « normal », contenant les évaluations et les opérations. Une évaluation est par exemple du type : `tag("#mondiv").contains("ce texte »)`. Cette évaluation (ou cette opération) crée une instance `{TCase}` qui sera ajoutée à la pile d’exécution (les `cases`) de `SWTest.current`. Pour voir comment la méthode `tag` crée une instance `{TCase}`, cf. [Création des `TCase`s](#creationtcases).



<a name="creationSujet"></a>

## Création d’un nouveau sujet

Pour le moment, on trouve par exemple les sujets `Tag`, qui permet d’interagir avec le contenu de la page, `Site` qui permet d’interagir et de tester le site en tant qu’objet internet ou encore `Db` qui permet de tester et d’interagir avec la base de données.

Voici les étapes pour créer un nouveau sujet :

* Définir un nom unique et parlant. Par exemple `Str` pour tester les `String`.

* Créer le fichier correspondant dans le dossier `app/js/then-required/testClasses/` (p.e. `Str.js`).

* Dans ce fichier, initier la classe en héritant de `SWTSubject` :

  ~~~javascript
  class Str extends SWTSubject {
    constructor(monTexte){
      super()
      this.context = 'String'
      this.subject = monTexte
    }
  }
  ~~~

  Ne pas oublier de définir le `context`, unique.

* On peut ensuite définir une méthode de test, qui pourrait donc être utilisée dans les feuilles de tests par `Str("mon String").mange(<options>)`

  ~~~javascript
  class Str extends SWTSubject {
    // ...

    mange(options){
      var tcase = new TCase(this, 'expectation', 'mange')
      tcase.set({
        // On définit ici tout ce qui va servir pour l'évaluation
        // Par exemple :
        subject: this.subject
      , waitFor: "le tag à attendre if any"   
  	  , eval: "code à évaluer"
      , expected: "la valeur attendue"
      , options: options
      , inverse: this.inverse // si on peut utiliser 'not'
        // etc.
      })
    }
    mangeMessage(){
      return {
  	      success: "..."
        , failure: "..."
        , successInverse: "..."
        , failureInverse: "..."
      }
    }
    mangeEvaluate(data){
      data.success = !data.inverse == (...)
    }
  }
  ~~~



* Définir la méthode `treateDataAs<context>` dans le fichier `./_side-front/SiteWebTestor-API/siteweb-testor-api/Interface.js`. C'est cette méthode qui va traiter les méthodes de l’objet côté site.

  ~~~javascript
  treateDataAsString(data/*data reçues du tcase*/){
    switch(data.action /* par exemple */){
       ///...
    }
    // Pour retourner les données au testor
    this.sendToTestor.call(this,data)
  }
  ~~~



<a name="creationtcases"></a>

### Création des `TCases`

Les méthodes du fichier `test_methods` sont utilisés pour définir les **évaluations** et les **opérations** des fichiers de tests. Il s’agit par exemple de la méthode `tag` qui crée un sujet balise DOM, ou de la méthode `click` qui permet de cliquer un élément.

Que ce soit une *opération* (cliquer un élément, remplir un formulaire) ou une *évaluation*  (vérifier que le contenu d’une balise contient le texte attendu, checker le contenu d’un ficher), une instance `TCase` n'est créée et enregistrée dans la pile d’exécution de la feuille de test (instance `SWTest`) que lorsqu’un test est nécessaire. Par exemple, `tag("#mondiv")` ne produit pas de TCase tandis que `tag("#mondiv").contains("ce texte")` en crée une.

Un `TCase` possède une propriété `expectation` qui est une instance `{Expectation}` qui va permettre d’évaluer le résultat et de produire le rapport.

## Envoyer un code à évaluer sur le site

Pour envoyer un code à évaluer sur le site, utiliser l’instance `{SWTestor}` courante (`<testor>`) avec :

~~~javascript
testor.send({eval: "<code à évaluer>"})
~~~

Par exemple :

~~~javascript
testor.send({eval: "document.querySelector('H1').innerHTML"})
~~~

Cet envoi relèvera le contenu de la première balise `H1` du site et retournera le résultat au testeur.

Note (TODO) : ajouter un numéro unique de requête dans les données envoyées (ou se servir du time ?) pour retourner la donnée. De cette manière, plusieurs requêtes asynchrones peuvent être envoyées sans se « perdre » .

TODO : réfléchir à comment faire. Faut-il une instance requête qui facilite tout ça ? Toute demande au site s’appelant une requête.



## Feuille de test

Pour le moment, des vœux pieux.

* aucune asynchronicité déclarée (voir le [fonctionnement sans déclaration d'async](#foncsansasync))



<a name=" foncsansasync"></a>

### Fonctionnement sans déclaration d'async

Pour le fonctionnement sans asynchronicité, on part simplement du principe que chaque ligne de test est asynchrone. Mais chaque ligne de test ne fait que remplir une pile d’exécution qui ne sera lancée que lorsque toute la pile aura été remplie.

Par exemple, si on a :

~~~javascript
tag("div#titre_site").is("Atelier Icare")
click('a[href="login"]')
fill("form#form_user_login").with({user_mail:'...', user_password:'...'}.submit())
~~~

Alors chaque ligne, `tag`, `click`, `fill`, etc. ne va faire qu’alimenter la pile d’exécution qui ne sera lancée que lorsque toute la feuille de test aura été chargée.

Donc, `tag("…")`, d’abord, définit une recherche de balise dans la page. L’interface site attendra cette balise jusqu’à ce qu’elle soit présente dans la page.
