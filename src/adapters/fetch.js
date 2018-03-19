import { isSupportAdvanced, isFunction, arrayEach } from '../core/utils'
import { XEResponse, toResponse } from '../handle/response'
import { requestInterceptor, responseInterceptor } from '../handle/interceptor'

function sendFetch (request, resolve, reject) {
  var $fetch = isFunction(request.$fetch) ? request.$fetch : self.fetch
  var options = {
    _request: request,
    method: request.method,
    cache: request.cache,
    credentials: request.credentials,
    body: request.getBody(),
    headers: request.headers
  }
  if (request.timeout) {
    setTimeout(function () {
      reject(new TypeError('Request timeout.'))
    }, request.timeout)
  }
  if (request.signal && request.signal.aborted) {
    reject(new TypeError('The user aborted a request.'))
  } else {
    $fetch(request.getUrl(), options).then(function (resp) {
      responseInterceptor(request, toResponse(resp, request)).then(resolve)
    }).catch(reject)
  }
}

function sendXHR (request, resolve, reject) {
  var $XMLHttpRequest = isFunction(request.$XMLHttpRequest) ? request.$XMLHttpRequest : XMLHttpRequest
  var xhr = request.xhr = new $XMLHttpRequest()
  xhr._request = request
  xhr.open(request.method, request.getUrl(), true)
  if (request.timeout) {
    setTimeout(function () {
      xhr.abort()
    }, request.timeout)
  }
  request.headers.forEach(function (value, name) {
    xhr.setRequestHeader(name, value)
  })
  xhr.onload = function () {
    responseInterceptor(request, new XEResponse(xhr.response, {
      status: xhr.status,
      statusText: parseStatusText(xhr),
      headers: parseXHRHeaders(xhr)
    }, request)).then(resolve)
  }
  xhr.onerror = function () {
    reject(new TypeError('Network request failed'))
  }
  xhr.ontimeout = function () {
    reject(new TypeError('Request timeout.'))
  }
  xhr.onabort = function () {
    reject(new TypeError('The user aborted a request.'))
  }
  if (isSupportAdvanced()) {
    xhr.responseType = 'blob'
  }
  if (request.credentials === 'include') {
    xhr.withCredentials = true
  } else if (request.credentials === 'omit') {
    xhr.withCredentials = false
  }
  xhr.send(request.getBody())
  if (request.$abort) {
    xhr.abort()
  }
}

function getRequest (request) {
  if (request.$fetch) {
    return request.signal ? sendXHR : sendFetch
  } else if (self.fetch) {
    if (typeof AbortController === 'function' && typeof AbortSignal === 'function') {
      return sendFetch
    }
    return request.signal ? sendXHR : sendFetch
  }
  return sendXHR
}

function createRequestFactory () {
  if (self.fetch) {
    return function (request, resolve, reject) {
      return getRequest(request).apply(this, arguments)
    }
  }
  return sendXHR
}

var sendRequest = createRequestFactory()

/**
 * fetch 异步请求
 * @param { XHR } xhr 请求
 * @param { Promise.resolve } resolve 成功 Promise
 * @param { Promise.reject } reject 失败 Promise
 */
export function fetchRequest (request, resolve, reject) {
  return requestInterceptor(request).then(function () {
    return sendRequest(request, resolve, reject)
  })
}

function parseXHRHeaders (options) {
  var headers = {}
  if (options.getAllResponseHeaders) {
    var allResponseHeaders = options.getAllResponseHeaders().trim()
    if (allResponseHeaders) {
      arrayEach(allResponseHeaders.split('\n'), function (row) {
        var index = row.indexOf(':')
        headers[row.slice(0, index).trim()] = row.slice(index + 1).trim()
      })
    }
  }
  return headers
}

function parseStatusText (options) {
  if (options.status === 1223 || options.status === 204) {
    return 'No Content'
  } else if (options.status === 304) {
    return 'Not Modified'
  } else if (options.status === 404) {
    return 'Not Found'
  }
  return (options.statusText || options.statusText || '').trim()
}
