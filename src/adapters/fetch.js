'use strict'

var utils = require('../core/utils')
var xhrExports = require('./xhr')
var httpExports = require('./http')
var interceptorExports = require('../handle/interceptor')
var handleExports = require('../handle')
var errorExports = require('./error')

/**
 * fetch
 * @param { XERequest } request
 * @param { Promise.resolve } resolve
 * @param { Promise.reject } reject
 */
function sendFetch (request, resolve, reject) {
  var timer = null
  var $fetch = request.$fetch || self.fetch
  var options = {
    _request: request,
    method: request.method,
    cache: request.cache,
    credentials: request.credentials,
    body: request.getBody(),
    headers: request.headers
  }
  if (request.timeout) {
    timer = setTimeout(function () {
      interceptorExports.responseRejects(request, errorExports.timeout(), resolve, reject)
    }, request.timeout)
  }
  if (request.signal && request.signal.aborted) {
    interceptorExports.responseRejects(request, errorExports.aborted(), resolve, reject)
  } else {
    $fetch(request.getUrl(), options).then(function (resp) {
      clearTimeout(timer)
      interceptorExports.responseResolves(request, handleExports.toResponse(resp, request), resolve, reject)
    }).catch(function (e) {
      clearTimeout(timer)
      interceptorExports.responseRejects(request, e, resolve, reject)
    })
  }
}

function getRequest (request) {
  if (request.$fetch) {
    return request.signal ? xhrExports.sendXHR : sendFetch
  } else if (utils.isFetch) {
    if (typeof AbortController !== 'undefined' && typeof AbortSignal !== 'undefined') {
      return sendFetch
    }
    return request.signal ? xhrExports.sendXHR : sendFetch
  }
  return xhrExports.sendXHR
}

function createRequestFactory () {
  if (utils.isNodeJS) {
    return httpExports.sendHttp
  } else if (utils.isFetch) {
    return function (request, resolve, reject) {
      return getRequest(request).apply(this, arguments)
    }
  }
  return xhrExports.sendXHR
}

var sendRequest = createRequestFactory()

function fetchRequest (request, resolve, reject) {
  return interceptorExports.requests(request).then(function () {
    return sendRequest(request, resolve, reject)
  })
}

var fetchExports = {
  fetchRequest: fetchRequest
}

module.exports = fetchExports
