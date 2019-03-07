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
  var url
  var timer
  var isTimeout = false
  var reqTimeout = request.timeout
  var jsonpCallback = request.jsonpCallback
  var clearTimeoutFn = clearTimeout
  var script = request.script = $dom.createElement('script')
  if (!jsonpCallback) {
    jsonpCallback = request.jsonpCallback = 'jsonp_xe_' + new Date().getTime() + '_' + (++jsonpIndex)
  }
  if (utils.isFn(request.$jsonp)) {
    return request.$jsonp(script, request).then(function (resp) {
      handleExports.toResponse({ status: 200, body: resp }, request).then(finish)
    })['catch'](function () {
      failed()
    })
  } else {
    url = request.getUrl()
    $global[jsonpCallback] = function (body) {
      if (!isTimeout) {
        clearTimeoutFn(timer)
        jsonpClear(request, jsonpCallback)
        finish({ status: 200, body: body })
      }
    }
    script.type = 'text/javascript'
    script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + request.jsonp + '=' + jsonpCallback
    script.onerror = function () {
      if (!isTimeout) {
        clearTimeoutFn(timer)
        jsonpClear(request, jsonpCallback)
        failed()
      }
    }
    if (reqTimeout) {
      timer = setTimeout(function () {
        isTimeout = true
        jsonpClear(request, jsonpCallback)
        finish({ status: 0, body: null })
      }, reqTimeout)
    }
    $dom.body.appendChild(script)
  }
}

function jsonpClear (request, jsonpCallback, UNDEFINED) {
  var script = request.script
  var $body = $dom.body
  if (script.parentNode === $body) {
    $body.removeChild(script)
  }
  try {
    delete $global[jsonpCallback]
  } catch (e) {
    // IE8
    $global[jsonpCallback] = UNDEFINED
  }
}

module.exports = sendJSONP
