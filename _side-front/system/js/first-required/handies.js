'use strict'

// Pour pouvoir utiliser par exemple 'correct || raise("Ça n’est pas correct")'
function raise(msgErr) {
  throw new Error(msgErr)
}

function humanDateFor(date){
  if ( ! date ) return ''
  const hd = date instanceof Date ? date : new Date(date)
  var jour = hd.getDate()
  var mois = MOIS[hd.getMonth()].long
  var anne = hd.getFullYear()
  return `${jour} ${mois} ${anne}`
}
// Reçoit une date et retourne une valeur MM/JJ/YYYY en fonction délimiteur
// transmis ('/') par défaut
function mmddyyyy(date, delimiter){
  // console.log("-> mmddyyyy(%s)", date)
  delimiter = delimiter || '/'
  if ( date ) {
    date = new Date(date)
    return [date.getMonth()+1,date.getDate(),date.getFullYear()].join(delimiter)
  } else {
    return ''
  }
}
function ddmmyyyy(date, delimiter){
  delimiter = delimiter || '/'
  if (false === (date instanceof Date)) date = new Date(date)
  console.log("date, date.getDate() = ", date, date.getDate())
  return [date.getDate(),date.getMonth()+1,date.getFullYear()].join(delimiter)
}
// Reçoit une date et retourne une valeur YYYY-MM-DD en fonction délimiteur
// transmis ('-' par défaut)
// Si date n'est pas fournie, on prend la date du moment
// typiquement pour les noms de fichiers
function yyyymmdd(date, delimiter){
  delimiter = delimiter || '-'
  date = date ? new Date(date) : new Date()
  return [date.getFullYear(),date.getMonth()+1,date.getDate()].join(delimiter)
}

function stopEvent(ev){
  ev.preventDefault()
  ev.stopPropagation()
  return false
}
