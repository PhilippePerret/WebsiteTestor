# Website-testor<br>Manuel du développeur

[TOC]

## À faire

- Une méthode simple qui vérifie tout le temps si la page est prêt. Quelque chose comme `site.waitForReady()`. Elle doit être appelée implicitement avec plein de méthodes à commencer par `site.load` qui charge une page particulière dans la fenêtre du site.

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



### Détail des opérations avec les méthodes et objets fournis

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

   1. l’instance `{Interface} <swtInterface>` côté site envoie un message à l’interface `{SWTInterface}` côté testeur pour lui dire que le site est prêt à être testé (`{'firstReady':true})` à l’aide la méthode `sendTestor(<data>)`. Note : la méthode s’appelle « send Testor » mais c’est en fait à l’interface du testeur que sont envoyés tous les messages.
   2. `<swtInterface>` (côté site), en recevant le `firstReady = true`, dit au testeur qu’il peut commencer ses tests en appelant `<testor>.start()`.

5. `<testor>.start` lance les tests. Pour les essais, il envoie aussi un message à afficher par le site, à l’aide de sa méthode `<testor>.sendMessage(<msg>)`. Note : il peut utiliser la méthode `<testor>.send(<data>)` pour envoyer des données, et notamment avec la propriété `eval:` qui donne le code à évaluer côté site. Par exemple, `<testor>.send({eval:'alert("Salut le monde !")'})` provoquera l’affichage du message « Salut le monde ! » sur le site.



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