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
  var timer = null
  var $fetch = request.$fetch || self.fetch
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
  if (request.timeout) {
    timer = setTimeout(function () {
      failed('timeout')
    }, request.timeout)
  }
  if (request.signal && request.signal.aborted) {
    failed('aborted')
  } else {
    $fetch(request.getUrl(), options).then(function (resp) {
      clearTimeout(timer)
      finish(handleExports.toResponse(resp, request))
    }).catch(function (e) {
      clearTimeout(timer)
      failed()
    })
  }
}

function getRequest (request) {
  if (request.$fetch) {
    return request.signal ? sendXHR : sendFetch
  } else if (utils.isFetch) {
    if (typeof AbortController !== 'undefined' && typeof AbortSignal !== 'undefined') {
      return sendFetch
    }
    return request.signal ? sendXHR : sendFetch
  }
  return sendXHR
}

function createRequestFactory () {
  if (utils.isNodeJS) {
    return sendHttp
  } else if (utils.isFetch) {
    return function (request, finish, failed) {
      return getRequest(request).apply(this, arguments)
    }
  }
  return sendXHR
}

var fetchRequest = createRequestFactory()

module.exports = fetchRequest
