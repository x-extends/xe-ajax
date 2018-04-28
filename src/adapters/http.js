'use strict'

var http = require('http')
var https = require('https')
var url = require('url')
var utils = require('../core/utils')
var interceptorExports = require('../handle/interceptor')
var XEResponse = require('../handle/response')
var handleExports = require('../handle')

function httpRequest (request, resolve, reject) {
  var timer = null
  var body = request.getBody()
  var urlLocat = url.parse(request.getUrl())
  var options = {
    hostname: urlLocat.hostname,
    port: urlLocat.port,
    path: urlLocat.path,
    method: request.method,
    headers: {}
  }

  if (request.agent) {
    options.agent = request.agent
  }

  if (body) {
    options.headers['Content-Length'] = Buffer.byteLength(body)
  }

  request.headers.forEach(function (value, name) {
    options.headers[name] = value
  })

  var req = getHttp(urlLocat).request(options, function (res) {
    var chunks = []
    var chunkSize = 0

    clearTimeout(timer)
    res.setEncoding('utf8')
    res.on('data', function (chunk) {
      var buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      chunks.push(buf)
      chunkSize += buf.length
    })

    res.on('end', function () {
      var responseData = Buffer.concat(chunks, chunkSize)
      interceptorExports.responseInterceptor(request, new XEResponse(responseData.toString('utf8'), {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers
      }, request)).then(resolve)
    })

    res.on('error', function (e) {
      if (!req.aborted) {
        reject(new TypeError('Network request failed'))
      }
    })
  })

  req.on('error', function (e) {
    reject(new TypeError('Network request failed'))
  })

  if (body) {
    req.write(body)
  }

  if (request.timeout) {
    timer = setTimeout(function () {
      req.abort()
      reject(new TypeError('The user aborted a request.'))
    }, request.timeout)
  }

  req.end()
}

function getHttp (urlLocat) {
  return urlLocat.protocol === 'https:' ? https : http
}

function sendHttp (request, resolve, reject) {
  if (utils.isFunction(request.$http)) {
    var timer = null
    if (request.timeout) {
      timer = setTimeout(function () {
        reject(new TypeError('The user aborted a request.'))
      }, request.timeout)
    }
    return request.$http(request, function () {
      return httpRequest(request, resolve, reject)
    }, function (resp) {
      clearTimeout(timer)
      interceptorExports.responseInterceptor(request, handleExports.toResponse(resp, request)).then(resolve)
    })
  }
  return httpRequest(request, resolve, reject)
}

var httpExports = {
  sendHttp: sendHttp
}

module.exports = httpExports
