import { isFormData, isCrossOrigin, arrayEach } from '../core/utils'
import { toResponse } from '../handle/response'

/**
 * Interceptor Queue
 */
var state = {reqQueue: [], respQueue: []}

function useInterceptors (calls) {
  return function (callback) {
    if (calls.indexOf(callback) === -1) {
      calls.push(callback)
    }
  }
}

/**
 * Request Interceptor
 */
export function requestInterceptor (request) {
  var XEPromise = request.$Promise || Promise
  var thenInterceptor = XEPromise.resolve(request, request.$context)
  arrayEach(state.reqQueue, function (callback) {
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
 * Response Interceptor
 */
export function responseInterceptor (request, response) {
  var XEPromise = request.$Promise || Promise
  var thenInterceptor = XEPromise.resolve(response, request.$context)
  arrayEach(state.respQueue, function (callback) {
    thenInterceptor = thenInterceptor.then(function (response) {
      return new XEPromise(function (resolve) {
        callback(response, function (resp) {
          if (resp && resp.body && resp.status) {
            resolve(toResponse(resp, request))
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

export var interceptors = {
  request: {
    use: useInterceptors(state.reqQueue)
  },
  response: {
    use: useInterceptors(state.respQueue)
  }
}

// default interceptor
interceptors.request.use(function (request, next) {
  if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
    request.headers.set('Content-Type', 'application/x-www-form-urlencoded')
    if (!isFormData(request.body) && (request.bodyType === 'json-data' || request.bodyType === 'json_data')) {
      request.headers.set('Content-Type', 'application/json; charset=utf-8')
    }
  }
  if (isCrossOrigin(request.getUrl())) {
    request.headers.set('X-Requested-With', 'XMLHttpRequest')
  }
  next()
})
