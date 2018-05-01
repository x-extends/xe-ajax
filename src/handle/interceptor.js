'use strict'

var utils = require('../core/utils')
var handleExports = require('../handle')

/**
 * interceptor queue
 */
var iState = {
  reqQueue: {resolves: [], rejects: []},
  respQueue: {resolves: [], rejects: []}
}

function useInterceptors (queue) {
  return function (finish, failed) {
    if (queue.resolves.indexOf(finish) === -1) {
      queue.resolves.push(finish)
    }
    if (queue.rejects.indexOf(failed) === -1) {
      queue.rejects.push(failed)
    }
  }
}

/**
 * request interceptor
 */
function requestInterceptor (request) {
  var XEPromise = request.$Promise || Promise
  var thenInterceptor = XEPromise.resolve(request, request.$context)
  utils.arrayEach(iState.reqQueue.resolves, function (callback) {
    thenInterceptor = thenInterceptor.then(function (req) {
      return new XEPromise(function (resolve) {
        callback(req, function () {
          resolve(req)
        })
      }, request.$context)
    }).catch(function (e) {
      console.error(e)
    })
  })
  return thenInterceptor
}

/**
 * response interceptor
 */
function responseInterceptor (calls, request, response) {
  var XEPromise = request.$Promise || Promise
  var thenInterceptor = XEPromise.resolve(response, request.$context)
  utils.arrayEach(calls, function (callback) {
    thenInterceptor = thenInterceptor.then(function (response) {
      return new XEPromise(function (resolve) {
        callback(response, function (resp) {
          if (resp && resp.body && resp.status) {
            resolve(handleExports.toResponse(resp, request))
          } else {
            resolve(response)
          }
        }, request)
      }, request.$context)
    }).catch(function (e) {
      console.error(e)
    })
  })
  return thenInterceptor
}

var interceptors = {
  request: {
    use: useInterceptors(iState.reqQueue)
  },
  response: {
    use: useInterceptors(iState.respQueue)
  }
}

// default interceptor
interceptors.request.use(function (request, next) {
  if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
    if (!utils.isFormData(request.body)) {
      request.headers.set('Content-Type', 'application/x-www-form-urlencoded')
      if (request.bodyType === 'json-data' || request.bodyType === 'json_data') {
        request.headers.set('Content-Type', 'application/json; charset=utf-8')
      }
    }
  }
  if (utils.isCrossOrigin(request.getUrl())) {
    request.headers.set('X-Requested-With', 'XMLHttpRequest')
  }
  next()
})

var interceptorExports = {
  interceptors: interceptors,
  requestInterceptor: requestInterceptor,
  responseResolveInterceptor: function (request, response, resolve, reject) {
    responseInterceptor(iState.respQueue.resolves, request, response).then(resolve)
  },
  responseRejectInterceptor: function (request, response, resolve, reject) {
    responseInterceptor(iState.respQueue.rejects, request, response).then(function (e) {
      (handleExports.isResponse(e) ? resolve : reject)(e)
    })
  }
}

module.exports = interceptorExports
