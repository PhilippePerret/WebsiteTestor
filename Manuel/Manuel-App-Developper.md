# Website-testor<br>Manuel du développeur

[TOC]

## Communication entre fenêtre des tests et site

Normalement, il n’est pas possible de communiquer entre la fenêtre qui va contenir le site et la fenêtre qui contient les tests.

Pour se faire, on utilise un fichier provisoire.

**Fonctionnement général**

- On envoie un code Javascript à exécuter sur le site (par exemple le test de la présence d’un élément, un click sur un lien, etc.)
- Le code à exécuter produit, site-side (côté site), un fichier qui contient le résultat de l’opération.
- L’application test-side (côté test) lit le fichier pour connaitre le résultat et l’évalue.

**Fonctionnement détaillé**

- On appelle la méthode `site.exec` avec en argument le code à évaluer et la méthode à appeler avec le résultat (qu’on appellera `callback`)
- La méthode `site.exec` finalise le code et le transmet au processus principal en émettant un évènement `execute-js`,
- Le processus principal transmet le code à la fenêtre du site,
- La fenêtre du site exécute le code et met le résultat dans un fichier du dossier test (note : c’est le code envoyé par `site.exec` qui doit gérer le code d’écriture du fichier et tout le tralala),
- Le code une fois exécuté émet un évènement `res-from-executeJS` reçu par le renderer avec en argument `null` si tout s’est bien passé ou le message d’erreur si une erreur a été rencontrée (le mieux est quand même de mettre le code dans un `try{}catch{}` pour le gérer en détail),
- le gestionnaire d’évènement appelle alors la méthode `site.execResult()` avec en argument l’objet JSON récupéré du fichier.
- la méthode `site.execResult` appelle la méthode `callback` pour lui envoyer le résultat.