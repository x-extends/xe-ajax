'use strict'

var utils = require('../core/utils')
var interceptorExports = require('../handle/interceptor')
var handleExports = require('../handle')

var jsonpIndex = 0
var $global = typeof window === 'undefined' ? this : window

/**
 * jsonp
 * @param { XERequest } request
 * @param { Promise.resolve } resolve
 * @param { Promise.reject } reject
 */
function sendJSONP (request, resolve, reject) {
  request.script = document.createElement('script')
  interceptorExports.requestInterceptor(request).then(function () {
    var script = request.script
    if (!request.jsonpCallback) {
      request.jsonpCallback = 'jsonp_xeajax_' + Date.now() + '_' + (++jsonpIndex)
    }
    if (utils.isFunction(request.$jsonp)) {
      return request.$jsonp(script, request).then(function (resp) {
        interceptorExports.responseResolveInterceptor(request, handleExports.toResponse({status: 200, body: resp}, request), resolve, reject)
      }).catch(function (e) {
        interceptorExports.responseRejectInterceptor(request, e, resolve, reject)
      })
    } else {
      var url = request.getUrl()
      $global[request.jsonpCallback] = function (body) {
        jsonpSuccess(request, {status: 200, body: body}, resolve)
      }
      script.type = 'text/javascript'
      script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + request.jsonp + '=' + request.jsonpCallback
      script.onerror = function (evnt) {
        jsonpError(request, resolve, reject)
      }
      if (request.timeout) {
        setTimeout(function () {
          jsonpError(request, resolve, reject)
        }, request.timeout)
      }
      document.body.appendChild(script)
    }
  })
}

function jsonpClear (request) {
  if (request.script.parentNode === document.body) {
    document.body.removeChild(request.script)
  }
  try {
    delete $global[request.jsonpCallback]
  } catch (e) {
    // IE8
    $global[request.jsonpCallback] = undefined
  }
}

function jsonpSuccess (request, response, resolve, reject) {
  jsonpClear(request)
  interceptorExports.responseResolveInterceptor(request, handleExports.toResponse(response, request), resolve, reject)
}

function jsonpError (request, resolve, reject) {
  jsonpClear(request)
  interceptorExports.responseRejectInterceptor(request, new TypeError('JSONP request failed'), resolve, reject)
}

var jsonpExports = {
  sendJSONP: sendJSONP
}

module.exports = jsonpExports
