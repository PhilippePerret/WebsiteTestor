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



## Autre fonctionnement possible

Un autre fonctionnement serait peut-être possible (autre que celui de travailler avec deux fenêtres). Il consisterait à

- avoir le site dans un `iframe`, sur la page de l'application
- l’application qui gère les tests
- un script où une mini-application qui serait placé (en `ssh` par exemple) à la racine du site testé (dont on serait forcément le propriétaire) et qui permettrait, grâce à une API, de communiquer avec le site.

## Communication entre fenêtre des tests et site

Normalement, il n’est pas possible de communiquer entre la fenêtre qui va contenir le site et la fenêtre qui contient les tests.

Pour se faire, on utilise un fichier provisoire.

**Fonctionnement général**

- On envoie un code Javascript à exécuter sur le site (par exemple le test de la présence d’un élément, un click sur un lien, etc.)
- Le code à exécuter produit, site-side (côté site), un fichier qui contient le résultat de l’opération.
- L’application test-side (côté test) lit le fichier pour connaitre le résultat et l’évalue.

**Fonctionnement détaillé**

- On appelle la méthode `site.exec` avec en argument le code à évaluer,
- la méthode `site.exec` finalise le code et le transmet au processus principal en émettant un évènement `execute-js`,
- la méthode `site.exec` retourne une promesse,
- Le processus principal transmet le code à la fenêtre du site,
- La fenêtre du site exécute le code et met le résultat dans un fichier du dossier test (note : c’est le code envoyé par `site.exec` qui gère le code d’écriture du fichier et tout le tralala nécessaire),
- Le code une fois exécuté émet un évènement `res-from-executeJS` reçu par le renderer avec en argument `null` si tout s’est bien passé ou le message d’erreur si une erreur a été rencontrée (le mieux est quand même de mettre le code dans un `try{}catch{}` pour le gérer en détail),
- le gestionnaire d’évènement appelle alors la méthode `site.execResult()` avec en argument l’objet JSON récupéré du fichier.
- la méthode `site.execResult` appelle la méthode de résolution de la promesse de `site.exec` et poursuit donc le test.