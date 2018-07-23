'use strict'

var utils = require('../core/utils')
var sendXHR = require('./xhr')
var sendHttp = require('./http')
var handleExports = require('../handle')

/**
 * fetch
 * @param { XERequest } request
 * @param { Function } finish
 * @param { Function } failed
 */
function sendFetch (request, finish, failed) {
  var timer = ''
  var $fetch = request.$fetch || self.fetch
  var reqTimeout = request.timeout
  var options = {
    _request: request,
    method: request.method,
    mode: request.mode,
    cache: request.cache,
    credentials: request.credentials,
    redirect: request.redirect,
    body: request.getBody(),
    headers: request.headers
  }
  var reqSignal = request.signal
  var clearTimeoutFn = clearTimeout
  if (reqTimeout) {
    timer = setTimeout(function () {
      failed('timeout')
    }, reqTimeout)
  }
  if (reqSignal && reqSignal.aborted) {
    failed('aborted')
  } else {
    $fetch(request.getUrl(), options).then(function (resp) {
      clearTimeoutFn(timer)
      finish(handleExports.toResponse(resp, request))
    }).catch(function (e) {
      clearTimeoutFn(timer)
      failed()
    })
  }
}

function getRequest (request) {
  var reqSignal = request.signal
  if (request.$fetch) {
    return reqSignal ? sendXHR : sendFetch
  } else if (utils._F) {
    if (typeof AbortController !== 'undefined' && typeof AbortSignal !== 'undefined') {
      return sendFetch
    }
    return reqSignal ? sendXHR : sendFetch
  }
  return sendXHR
}

function createRequestFactory () {
  if (utils._N) {
    return sendHttp
  } else if (utils._F) {
    return function (request) {
      return getRequest(request).apply(this, arguments)
    }
  }
  return sendXHR
}

var fetchRequest = createRequestFactory()

module.exports = fetchRequest
