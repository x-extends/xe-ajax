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
  var isTimeout = false
  var $fetch = request.$fetch || self.fetch
  var reqTimeout = request.timeout
  var options = {
    _request: request,
    body: request.getBody()
  }
  var reqSignal = request.signal
  var clearTimeoutFn = clearTimeout
  utils.arrayEach('method,headers,signal,mode,cache,credentials,redirect,referrer,referrerPolicy,keepalive,integrity'.split(','), function (pro) {
    if (request[pro]) {
      options[pro] = request[pro]
    }
  })
  if (reqTimeout) {
    timer = setTimeout(function () {
      isTimeout = true
      failed('ERR_T')
    }, reqTimeout)
  }
  if (reqSignal && reqSignal.aborted) {
    failed('ERR_A')
  } else {
    $fetch(request.getUrl(), options).then(function (resp) {
      if (!isTimeout) {
        clearTimeoutFn(timer)
        handleExports.toResponse(resp, request).then(finish)
      }
    })['catch'](function (e) {
      if (!isTimeout) {
        clearTimeoutFn(timer)
        failed()
      }
    })
  }
}

function getRequest (request) {
  var reqSignal = request.signal
  if (!request.progress) {
    if (request.$fetch) {
      return reqSignal ? sendXHR : sendFetch
    } else if (utils.IS_F) {
      if (utils.IS_FAC) {
        return sendFetch
      }
      return reqSignal ? sendXHR : sendFetch
    }
  }
  return sendXHR
}

function createRequestFactory () {
  if (utils.IS_N) {
    return sendHttp
  } else if (utils.IS_F) {
    return function (request) {
      return getRequest(request).apply(this, arguments)
    }
  }
  return sendXHR
}

var fetchRequest = createRequestFactory()

module.exports = fetchRequest
