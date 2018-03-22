import { isFunction } from '../core/utils'
import { sendXHR } from './xhr'
import { toResponse } from '../handle/response'
import { requestInterceptor, responseInterceptor } from '../handle/interceptor'

/**
 * fetch
 * @param { XERequest } request
 * @param { Promise.resolve } resolve
 * @param { Promise.reject } reject
 */
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

export function fetchRequest (request, resolve, reject) {
  return requestInterceptor(request).then(function () {
    return sendRequest(request, resolve, reject)
  })
}
