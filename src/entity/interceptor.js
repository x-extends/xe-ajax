import { isFormData, arrayEach } from '../core/utils'
import { XEResponse, ResponseXHR } from '../entity/response'

/**
 * 拦截器队列
 */
var state = {request: [], response: []}

function useInterceptors (calls) {
  return function (callback) {
    if (calls.indexOf(callback) === -1) {
      calls.push(callback)
    }
  }
}

/**
 * Request 拦截器
 */
export function requestInterceptor (request) {
  var XEPromise = request.$Promise || Promise
  var thenInterceptor = XEPromise.resolve(request, request.$context)
  arrayEach(state.request, function (callback) {
    thenInterceptor = thenInterceptor.then(function (req) {
      return new XEPromise(function (resolve) {
        callback(req, function () {
          resolve(req)
        })
      }, request.$context)
    }).catch(function (req) {
      console.error(req)
    })
  })
  return thenInterceptor
}

/**
 * Response 拦截器
 */
export function responseInterceptor (request, response) {
  var XEPromise = request.$Promise || Promise
  var thenInterceptor = XEPromise.resolve(response, request.$context)
  arrayEach(state.response, function (callback) {
    thenInterceptor = thenInterceptor.then(function (resp) {
      return new XEPromise(function (resolve) {
        callback(resp, function (result) {
          if (result && result.constructor !== XEResponse) {
            resolve(new XEResponse(request, new ResponseXHR(result)))
          } else {
            resolve(resp)
          }
        })
      }, request.$context)
    }).catch(function (resp) {
      console.error(resp)
    })
  })
  return thenInterceptor
}

export var interceptors = {
  request: {
    use: useInterceptors(state.request)
  },
  response: {
    use: useInterceptors(state.response)
  }
}

// 默认拦截器
interceptors.request.use(function (request, next) {
  if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
    request.headers.set('Content-Type', 'application/x-www-form-urlencoded')
    if (!isFormData(request.body) && request.bodyType === 'JSON_DATA') {
      request.headers.set('Content-Type', 'application/json; charset=utf-8')
    }
  }
  if (request.crossOrigin) {
    request.headers.set('X-Requested-With', 'XMLHttpRequest')
  }
  next()
})
