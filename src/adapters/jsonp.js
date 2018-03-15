import { isFunction } from '../core/utils'
import { toResponse } from '../handle/response'
import { requestInterceptor, responseInterceptor } from '../handle/interceptor'

var jsonpIndex = 0
var $global = typeof window === 'undefined' ? this : window

/**
 * jsonp 请求结果处理
 * @param { XERequest } request 对象
 * @param { XHR } xhr 请求
 * @param { resolve } resolve 成功 Promise
 * @param { reject } reject 失败 Promise
 */
function jsonpHandle (request, response, resolve, reject) {
  if (request.script.parentNode === document.body) {
    document.body.removeChild(request.script)
  }
  delete $global[request.jsonpCallback]
  responseInterceptor(request, toResponse(response, request)).then(resolve)
}

/**
 * jsonp 异步请求
 */
export function sendJSONP (request, resolve, reject) {
  request.script = document.createElement('script')
  requestInterceptor(request).then(function () {
    var script = request.script
    if (!request.jsonpCallback) {
      request.jsonpCallback = '_xeajax_jsonp' + (++jsonpIndex)
    }
    if (isFunction(request.$jsonp)) {
      return request.$jsonp(script, request).then(function (resp) {
        responseInterceptor(request, toResponse(resp, request)).then(resolve)
      })
    } else {
      var url = request.getUrl()
      $global[request.jsonpCallback] = function (body) {
        jsonpHandle(request, {status: 200, body: body}, resolve, reject)
      }
      script.type = 'text/javascript'
      script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + request.jsonp + '=' + request.jsonpCallback
      script.onerror = function (evnt) {
        jsonpHandle(request, {status: 500, body: null}, resolve, reject)
      }
      script.onabort = function (evnt) {
        jsonpHandle(request, {status: 0, body: null}, resolve, reject)
      }
      if (request.timeout) {
        setTimeout(function () {
          script.onabort()
        }, request.timeout)
      }
      document.body.appendChild(script)
    }
  })
}
