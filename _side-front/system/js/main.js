'use strict'

const glob    = require('glob')
const {app}   = require('electron').remote
const exec    = require('child_process').exec
const { clipboard } = require('electron')

const Sys = {
}

document.addEventListener('DOMContentLoaded', function(event) {
  App.init.call(App)
})
