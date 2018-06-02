'use strict'

var utils = require('../core/utils')
var handleExports = require('../handle')

var jsonpIndex = 0
var $global = typeof window === 'undefined' ? '' : window
var $dom = $global ? $global.document : ''

/**
 * jsonp
 * @param { XERequest } request
 * @param { Function } finish
 * @param { Function } failed
 */
function sendJSONP (request, finish, failed) {
  request.script = $dom.createElement('script')
  var reqTimeout = request.timeout
  var jsonpCallback = request.jsonpCallback
  var script = request.script
  if (!jsonpCallback) {
    jsonpCallback = request.jsonpCallback = 'jsonp_xe_' + Date.now() + '_' + (++jsonpIndex)
  }
  if (utils.isFunction(request.$jsonp)) {
    return request.$jsonp(script, request).then(function (resp) {
      finish(handleExports.toResponse({status: 200, body: resp}, request))
    }).catch(function () {
      failed()
    })
  } else {
    var url = request.getUrl()
    $global[jsonpCallback] = function (body) {
      jsonpClear(request, jsonpCallback)
      finish({status: 200, body: body})
    }
    script.type = 'text/javascript'
    script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + request.jsonp + '=' + jsonpCallback
    script.onerror = function () {
      jsonpClear(request, jsonpCallback)
      finish()
    }
    if (reqTimeout) {
      setTimeout(function () {
        jsonpClear(request, jsonpCallback)
        finish('timeout')
      }, reqTimeout)
    }
    $dom.body.appendChild(script)
  }
}

function jsonpClear (request, jsonpCallback) {
  if (request.script.parentNode === $dom.body) {
    $dom.body.removeChild(request.script)
  }
  try {
    delete $global[jsonpCallback]
  } catch (e) {
    // IE8
    $global[jsonpCallback] = undefined
  }
}

module.exports = sendJSONP
