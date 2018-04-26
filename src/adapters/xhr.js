'use strict'

var utils = require('../core/utils')
var XEResponse = require('../handle/response')
var interceptorExports = require('../handle/interceptor')

/**
 * xhr
 * @param { XERequest } request
 * @param { Promise.resolve } resolve
 * @param { Promise.reject } reject
 */
function sendXHR (request, resolve, reject) {
  var $XMLHttpRequest = utils.isFunction(request.$XMLHttpRequest) ? request.$XMLHttpRequest : XMLHttpRequest
  var xhr = request.xhr = new $XMLHttpRequest()
  xhr._request = request
  xhr.open(request.method, request.getUrl(), true)
  if (request.timeout) {
    setTimeout(function () {
      xhr.abort()
    }, request.timeout)
  }
  request.headers.forEach(function (value, name) {
    xhr.setRequestHeader(name, value)
  })
  xhr.onload = function () {
    interceptorExports.responseInterceptor(request, new XEResponse(xhr.response, {
      status: xhr.status,
      statusText: xhr.statusText,
      headers: parseXHRHeaders(xhr)
    }, request)).then(resolve)
  }
  xhr.onerror = function () {
    reject(new TypeError('Network request failed'))
  }
  xhr.ontimeout = function () {
    reject(new TypeError('Request timeout.'))
  }
  xhr.onabort = function () {
    reject(new TypeError('The user aborted a request.'))
  }
  if (utils.isSupportAdvanced()) {
    xhr.responseType = 'blob'
  }
  if (request.credentials === 'include') {
    xhr.withCredentials = true
  } else if (request.credentials === 'omit') {
    xhr.withCredentials = false
  }
  xhr.send(request.getBody())
  if (request.$abort) {
    xhr.abort()
  }
}

function parseXHRHeaders (options) {
  var headers = {}
  if (options.getAllResponseHeaders) {
    var allResponseHeaders = options.getAllResponseHeaders().trim()
    if (allResponseHeaders) {
      utils.arrayEach(allResponseHeaders.split('\n'), function (row) {
        var index = row.indexOf(':')
        headers[row.slice(0, index).trim()] = row.slice(index + 1).trim()
      })
    }
  }
  return headers
}

var xhrExports = {
  sendXHR: sendXHR
}

module.exports = xhrExports
