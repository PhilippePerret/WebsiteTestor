// Essai de test SWT

// On se rend sur la page d'accueil
visit('/')

// La page d'accueil doit être conforme
tag('div#titre_site').exists()

// // Pour voir si la page du site d'accueil est bien chargée
// tag('div#titre_site').contains("Atelier Icare")
//
// // Pour cliquer sur le bouton pour s'identifier
// click('a#login-button')
//
// // Pour remplir le formulaire d'identification
// tag('form#form_user_login')
//   .fillWith({
//     login_mail: "phil@chez.lui", login_password: "sonmotdepasse"
//   })
//   .andSubmit()
