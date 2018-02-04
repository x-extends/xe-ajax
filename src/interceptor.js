import { isFormData, arrayEach } from './util'

/**
 * 拦截器
 */
export var requestCalls = []
export var responseCalls = []

function useInterceptors (state) {
  return function (callback) {
    if (state.indexOf(callback) === -1) {
      state.push(callback)
    }
  }
}

/**
 * 拦截器处理
 * @param { Array } calls 调用链
 * @param { Object } result 数据
 */
function callPromises (calls, result) {
  var thenInterceptor = Promise.resolve(result)
  arrayEach(calls, function (callback) {
    thenInterceptor = thenInterceptor.then(function (data) {
      return new Promise(function (resolve) {
        callback(data, function () {
          resolve(data)
        })
      })
    }).catch(function (data) {
      console.error(data)
    })
  })
  return thenInterceptor
}

export function requestInterceptor (data) {
  return callPromises(requestCalls, data)
}

export function responseInterceptor (data) {
  return callPromises(responseCalls, data)
}

export var interceptors = {
  request: {
    use: useInterceptors(requestCalls)
  },
  response: {
    use: useInterceptors(responseCalls)
  }
}

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
