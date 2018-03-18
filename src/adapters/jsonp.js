import { isFunction } from '../core/utils'
import { toResponse } from '../handle/response'
import { requestInterceptor, responseInterceptor } from '../handle/interceptor'

var jsonpIndex = 0
var $global = typeof window === 'undefined' ? this : window

function jsonpClear (request) {
  if (request.script.parentNode === document.body) {
    document.body.removeChild(request.script)
  }
  try {
    delete $global[request.jsonpCallback]
  } catch (e) {
    $global[request.jsonpCallback] = undefined
  }
}

function jsonpSuccess (request, response, resolve) {
  jsonpClear(request)
  responseInterceptor(request, toResponse(response, request)).then(resolve)
}

function jsonpError (request, reject) {
  jsonpClear(request)
  reject(new TypeError('JSONP request failed'))
}

/**
 * jsonp 异步请求
 */
export function sendJSONP (request, resolve, reject) {
  request.script = document.createElement('script')
  requestInterceptor(request).then(function () {
    var script = request.script
    if (!request.jsonpCallback) {
      request.jsonpCallback = 'jsonp_xeajax_' + Date.now() + '_' + (++jsonpIndex)
    }
    if (isFunction(request.$jsonp)) {
      return request.$jsonp(script, request).then(function (resp) {
        responseInterceptor(request, toResponse({status: 200, body: resp}, request)).then(resolve)
      }).catch(function (e) {
        reject(e)
      })
    } else {
      var url = request.getUrl()
      $global[request.jsonpCallback] = function (body) {
        jsonpSuccess(request, {status: 200, body: body}, resolve)
      }
      script.type = 'text/javascript'
      script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + request.jsonp + '=' + request.jsonpCallback
      script.onerror = function (evnt) {
        jsonpError(request, reject)
      }
      if (request.timeout) {
        setTimeout(function () {
          jsonpError(request, reject)
        }, request.timeout)
      }
      document.body.appendChild(script)
    }
  })
}
