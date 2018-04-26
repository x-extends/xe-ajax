'use strict'

var http = require('http')
var https = require('https')

function parseUrl () {
  return {}
}

function sendHttp (request, resolve, reject) {
  var options = parseUrl(request)
  var send = (options.protocol === 'https:' ? https : http).request
  var req = send(options)

  req.on('response', res => {

  })

  req.on('error', e => {
    reject(new TypeError('Network request failed'))
  })

  req.end()
}

var httpExports = {
  sendHttp: sendHttp
}

module.exports = httpExports
