'use strict'

var utils = require('../core/utils')
var handleExports = require('../handle')

var jsonpIndex = 0
var $global = typeof window === 'undefined' ? this : window

/**
 * jsonp
 * @param { XERequest } request
 * @param { Function } finish
 * @param { Function } failed
 */
function sendJSONP (request, finish, failed) {
  request.script = document.createElement('script')
  var script = request.script
  if (!request.jsonpCallback) {
    request.jsonpCallback = 'jsonp_xe_' + Date.now() + '_' + (++jsonpIndex)
  }
  if (utils.isFunction(request.$jsonp)) {
    return request.$jsonp(script, request).then(function (resp) {
      finish(handleExports.toResponse({status: 200, body: resp}, request))
    }).catch(function () {
      failed()
    })
  } else {
    var url = request.getUrl()
    $global[request.jsonpCallback] = function (body) {
      jsonpClear(request)
      finish({status: 200, body: body})
    }
    script.type = 'text/javascript'
    script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + request.jsonp + '=' + request.jsonpCallback
    script.onerror = function (evnt) {
      jsonpClear(request)
      finish()
    }
    if (request.timeout) {
      setTimeout(function () {
        jsonpClear(request)
        finish('timeout')
      }, request.timeout)
    }
    document.body.appendChild(script)
  }
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

var jsonpExports = {
  sendJSONP: sendJSONP
}

module.exports = jsonpExports
