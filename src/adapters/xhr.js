'use strict'

var utils = require('../core/utils')
var XEResponse = require('../handle/response')

/**
 * xhr
 * @param { XERequest } request
 * @param { Function } finish
 * @param { Function } failed
 */
function sendXHR (request, finish, failed) {
  var url = request.getUrl()
  var reqTimeout = request.timeout
  var reqCredentials = request.credentials
  if (request.mode === 'same-origin') {
    if (utils.isCrossOrigin(url)) {
      failed()
      throw new TypeError('Fetch API cannot load ' + url + '. Request mode is "same-origin" but the URL\'s origin is not same as the request origin ' + utils.getOrigin() + '.')
    }
  }
  var $XMLHttpRequest = request.$XMLHttpRequest || XMLHttpRequest
  var xhr = request.xhr = new $XMLHttpRequest()
  xhr._request = request
  xhr.open(request.method, url, true)
  if (reqTimeout) {
    setTimeout(function () {
      xhr.abort()
    }, reqTimeout)
  }
  utils.headersEach(request.headers, function (value, name) {
    xhr.setRequestHeader(name, value)
  })
  xhr.onload = function () {
    finish(new XEResponse(xhr.response, {
      status: xhr.status,
      statusText: xhr.statusText,
      headers: parseXHRHeaders(xhr)
    }, request))
  }
  xhr.onerror = function () {
    failed()
  }
  xhr.ontimeout = function () {
    failed('E_T')
  }
  xhr.onabort = function () {
    failed('E_A')
  }
  if (utils._A) {
    xhr.responseType = 'blob'
  }
  if (reqCredentials === 'include') {
    xhr.withCredentials = true
  } else if (reqCredentials === 'omit') {
    xhr.withCredentials = false
  }
  xhr.send(request.getBody())
  if (request.$abort) {
    xhr.abort()
  }
}

function parseXHRHeaders (xhr) {
  var headers = {}
  var allResponseHeaders = xhr.getAllResponseHeaders().trim()
  utils.arrayEach(allResponseHeaders.split('\n'), function (row) {
    var index = row.indexOf(':')
    headers[row.slice(0, index).trim()] = row.slice(index + 1).trim()
  })
  return headers
}

module.exports = sendXHR
