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
  var $XMLHttpRequest = request.$XMLHttpRequest || XMLHttpRequest
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
    failed('timeout')
  }
  xhr.onabort = function () {
    failed('aborted')
  }
  if (utils.isSupportAdvanced) {
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

function parseXHRHeaders (xhr) {
  var headers = {}
  var allResponseHeaders = xhr.getAllResponseHeaders().trim()
  if (allResponseHeaders) {
    utils.arrayEach(allResponseHeaders.split('\n'), function (row) {
      var index = row.indexOf(':')
      headers[row.slice(0, index).trim()] = row.slice(index + 1).trim()
    })
  }
  return headers
}

var xhrExports = {
  sendXHR: sendXHR
}

module.exports = xhrExports
