import { isFormData, arrayEach, objectAssign } from './util'
import XEAjaxResponse from './response'

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

function ResponseXHR (result) {
  try {
    var responseText = JSON.stringify(result.body)
  } catch (e) {
    responseText = ''
  }
  this.status = result.status
  this.responseHeaders = result.headers
  this.response = responseText
  this.responseText = responseText
}

objectAssign(ResponseXHR.prototype, {
  getAllResponseHeaders: function () {
    var result = ''
    var responseHeader = this.responseHeaders
    if (responseHeader) {
      for (var key in responseHeader) {
        if (responseHeader.hasOwnProperty(key)) {
          result += key + ': ' + responseHeader[key] + '\n'
        }
      }
    }
    return result
  }
})

/**
 * Request 拦截器
 */
export function requestInterceptor (request) {
  var XEPromise = request.$Promise
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
  var XEPromise = request.$Promise
  var thenInterceptor = XEPromise.resolve(response, request.$context)
  arrayEach(state.response, function (callback) {
    thenInterceptor = thenInterceptor.then(function (resp) {
      return new XEPromise(function (resolve) {
        callback(resp, function (result) {
          if (result && result.constructor !== XEAjaxResponse) {
            resolve(new XEAjaxResponse(request, new ResponseXHR(result)))
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
  if (!isFormData(request.method === 'GET' ? request.params : request.body)) {
    if (request.method !== 'GET' && String(request.bodyType).toLocaleUpperCase() === 'JSON_DATA') {
      request.setHeader('Content-Type', 'application/json; charset=utf-8')
    } else {
      request.setHeader('Content-Type', 'application/x-www-form-urlencoded')
    }
  }
  if (request.crossOrigin) {
    request.setHeader('X-Requested-With', 'XMLHttpRequest')
  }
  next()
})
