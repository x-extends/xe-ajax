'use strict'

var utils = require('../core/utils')
var xhrExports = require('./xhr')
var httpExports = require('./http')
var interceptorExports = require('../handle/interceptor')
var handleExports = require('../handle')

/**
 * fetch
 * @param { XERequest } request
 * @param { Promise.resolve } resolve
 * @param { Promise.reject } reject
 */
function sendFetch (request, resolve, reject) {
  var timer = null
  var $fetch = utils.isFunction(request.$fetch) ? request.$fetch : self.fetch
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
      interceptorExports.responseRejectInterceptor(request, new TypeError('Request timeout.'), resolve, reject)
    }, request.timeout)
  }
  if (request.signal && request.signal.aborted) {
    interceptorExports.responseRejectInterceptor(request, new TypeError('The user aborted a request.'), resolve, reject)
  } else {
    $fetch(request.getUrl(), options).then(function (resp) {
      clearTimeout(timer)
      interceptorExports.responseResolveInterceptor(request, handleExports.toResponse(resp, request), resolve, reject)
    }).catch(function (e) {
      clearTimeout(timer)
      interceptorExports.responseRejectInterceptor(request, e, resolve, reject)
    })
  }
}

function getRequest (request) {
  if (request.$fetch) {
    return request.signal ? xhrExports.sendXHR : sendFetch
  } else if (typeof self !== 'undefined' && self.fetch) {
    if (typeof AbortController === 'function' && typeof AbortSignal === 'function') {
      return sendFetch
    }
    return request.signal ? xhrExports.sendXHR : sendFetch
  }
  return xhrExports.sendXHR
}

function createRequestFactory () {
  if (typeof XMLHttpRequest === 'undefined' && typeof process !== 'undefined') {
    return httpExports.sendHttp
  } else if (typeof self !== 'undefined' && self.fetch) {
    return function (request, resolve, reject) {
      return getRequest(request).apply(this, arguments)
    }
  }
  return xhrExports.sendXHR
}

var sendRequest = createRequestFactory()

function fetchRequest (request, resolve, reject) {
  return interceptorExports.requestInterceptor(request).then(function () {
    return sendRequest(request, resolve, reject)
  })
}

var fetchExports = {
  fetchRequest: fetchRequest
}

module.exports = fetchExports
