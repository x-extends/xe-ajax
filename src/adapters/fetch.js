import { isFunction } from '../core/utils'
import { XEResponse, responseComplete } from '../entity/response'
import { requestInterceptor } from '../entity/interceptor'

/**
 * fetch 异步请求
 * @param { XHR } xhr 请求
 * @param { Promise.resolve } resolve 成功 Promise
 * @param { Promise.reject } reject 失败 Promise
 */
export function fetchRequest (request, resolve, reject) {
  requestInterceptor(request).then(function () {
    if (!request.signal && typeof fetch === 'function') {
      var $fetch = isFunction(request.$fetch) ? request.$fetch : fetch
      request.getBody().then(function (body) {
        var options = {
          _request: request,
          method: request.method,
          cache: request.cache,
          credentials: request.credentials,
          body: body,
          headers: request.headers
        }
        if (request.timeout) {
          setTimeout(function () {
            responseComplete(request, {status: 0, body: null}, resolve)
          }, request.timeout)
        }
        $fetch(request.getUrl(), options).then(function (resp) {
          responseComplete(request, resp, resolve)
        }).catch(function (resp) {
          responseComplete(request, resp, reject)
        })
      })
    } else {
      var $XMLHttpRequest = isFunction(request.$XMLHttpRequest) ? request.$XMLHttpRequest : XMLHttpRequest
      var xhr = request.xhr = new $XMLHttpRequest()
      xhr._request = request
      xhr.open(request.method, request.getUrl(), true)
      if (request.timeout) {
        setTimeout(function () {
          responseComplete(request, {status: 0, body: null}, resolve)
        }, request.timeout)
      }
      request.headers.forEach(function (value, name) {
        xhr.setRequestHeader(name, value)
      })
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          responseComplete(request, new XEResponse(request, xhr), resolve)
        }
      }
      if (request.credentials === 'include') {
        xhr.withCredentials = true
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false
      }
      request.getBody().catch(function () {
        return null
      }).then(function (body) {
        xhr.send(body)
        if (request.$abort) {
          xhr.abort()
        }
      })
    }
  })
}
