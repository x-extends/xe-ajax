'use strict'

var http = require('http')
var https = require('https')
var url = require('url')
var utils = require('../core/utils')
var XEResponse = require('../handle/response')
var handleExports = require('../handle')

/**
 * nodejs
 * @param { XERequest } request
 * @param { Function } finish
 * @param { Function } failed
 */
function httpRequest (request, finish, failed) {
  var timer = ''
  var reqAgent = request.agent
  var reqTimeout = request.timeout
  var body = request.getBody()
  var urlLocat = url.parse(request.getUrl())
  var headers = {}
  var options = {
    hostname: urlLocat.hostname,
    port: urlLocat.port,
    path: urlLocat.path,
    method: request.method,
    headers: headers
  }

  if (reqAgent) {
    options.agent = reqAgent
  }

  if (body) {
    headers['Content-Length'] = Buffer.byteLength(body)
  }

  request.headers.forEach(function (value, name) {
    headers[name] = value
  })

  var req = getHttp(urlLocat).request(options, function (res) {
    var chunks = []
    var chunkSize = 0

    clearTimeout(timer)

    res.on('data', function (chunk) {
      var buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      chunks.push(buf)
      chunkSize += buf.length
    })

    res.on('end', function () {
      var responseData = Buffer.concat(chunks, chunkSize)
      finish(new XEResponse(responseData.toString('utf8'), {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers
      }, request))
    })

    res.on('error', function (e) {
      if (!req.aborted) {
        failed()
      }
    })
  })

  req.on('error', function (e) {
    failed()
  })

  if (body) {
    req.write(body)
  }

  if (reqTimeout) {
    timer = setTimeout(function () {
      req.abort()
      failed('timeout')
    }, reqTimeout)
  }

  req.end()
}

function getHttp (urlLocat) {
  return urlLocat.protocol === 'https:' ? https : http
}

function sendHttp (request, finish, failed) {
  var clearTimeoutFn = clearTimeout
  if (utils.isFn(request.$http)) {
    var timer = ''
    var reqTimeout = request.timeout
    if (reqTimeout) {
      timer = setTimeout(function () {
        failed('timeout')
      }, reqTimeout)
    }
    return request.$http(request, function () {
      clearTimeoutFn(timer)
      return httpRequest(request, finish, failed)
    }, function (resp) {
      clearTimeoutFn(timer)
      finish(handleExports.toResponse(resp, request))
    }, function (e) {
      clearTimeoutFn(timer)
      failed()
    })
  }
  return httpRequest(request, finish, failed)
}

module.exports = sendHttp
