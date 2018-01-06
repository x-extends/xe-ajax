import XEAjaxRequest from './request'
import XEAjaxResponse from './response'
import XEPromise from './promise'
import { isFunction, isFormData, isUndefined, eachObj } from './util'

var setupInterceptors = []
var setupDefaults = {
  method: 'get',
  baseURL: location.origin,
  async: true,
  bodyMode: 'json',
  headers: {
    Accept: 'application/json, text/plain, */*;'
  }
}

/**
  * XHR AJAX
  *
  * @param Object options 请求参数
  * @param Object context 上下文对象(this默认指向当前vue组件)
  * @return Promise
  */
export function XEAjax (options, context) {
  return new XEPromise(function (resolved, rejected) {
    return (options && options.jsonp ? sendJSONP : sendXHR)(new XEAjaxRequest(Object.assign({}, setupDefaults, {headers: Object.assign({}, setupDefaults.headers)}, options)), resolved, rejected, XEAjax.context)
  }, XEAjax.context)
}

function afterSendHandle (request, response, context) {
  var afterPromises = XEPromise.resolve(response)
  request._afterSends.forEach(function (fn) {
    afterPromises = afterPromises.then(function (response) {
      return fn.call(context, response) || response
    })['catch'](function (message) {
      console.error(message)
    })
  })
  return afterPromises
}

function sendEnd (request, response, resolved, rejected, context) {
  afterSendHandle(request, response, context).then(function (response) {
    if ((response.status >= 200 && response.status < 300) || response.status === 304) {
      resolved(response)
    } else {
      rejected(response)
    }
  })
}

function interceptorHandle (request, context) {
  var interceptorPromises = XEPromise.resolve()
  setupInterceptors.concat(request.iterators ? [request.iterators] : []).forEach(function (callback) {
    interceptorPromises = interceptorPromises.then(function (response) {
      if (response) {
        return response
      } else {
        return new XEPromise(function (resolved) {
          callback.call(context, request, function (response) {
            if (isUndefined(response)) {
              resolved()
            } else if (isFunction(response)) {
              request._afterSends.push(response)
              resolved()
            } else {
              resolved(new XEAjaxResponse(request, response))
            }
          })
        })
      }
    }).catch(function (message) {
      console.error(message)
    })
  })
  return interceptorPromises
}

function sendXHR (request, resolved, rejected, context) {
  var xhr = request.xhr
  interceptorHandle(request, context).then(function (response) {
    if (response && response.constructor === XEAjaxResponse) {
      return sendEnd(request, response, resolved, rejected, context)
    }
    xhr.open(request.method, request.getUrl(), request.async !== false)
    if (request.timeout) {
      xhr.timeout = request.timeout
    }
    eachObj(request.headers, function (value, name) {
      xhr.setRequestHeader(name, value)
    })
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        sendEnd(request, new XEAjaxResponse(request, xhr), resolved, rejected, context)
      }
    }
    xhr.send(request.getBody())
  })
}

function sendJSONP (request, resolved, rejected, context) {
  var script = request.script
  var url = request.getUrl()
  request.customCallback = global[request.jsonpCallback]
  global[request.jsonpCallback] = function (response) {
    jsonpHandle(request, new XEAjaxResponse(request, {status: 200, body: response}), resolved, rejected, context)
  }
  script.type = 'text/javascript'
  script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + request.jsonp + '=' + request.jsonpCallback
  script.onerror = function (evnt) {
    jsonpHandle(request, new XEAjaxResponse(request, {status: 500, body: null}), resolved, rejected, context)
  }
  document.body.appendChild(script)
}

function jsonpHandle (request, response, resolved, rejected, context) {
  delete global[request.jsonpCallback]
  document.body.removeChild(request.script)
  if (request.customCallback) {
    (global[request.jsonpCallback] = request.customCallback).call(context, response)
  }
  sendEnd(request, response, resolved, rejected, context)
}

/**
 * 参数
 *
 * @param String url 请求地址
 * @param String baseURL 基础路径
 * @param String method 请求方法(默认get)
 * @param Object params 请求参数
 * @param Object body 提交参数
 * @param String bodyMode 提交参数方式(默认json) 支持[json:以json方式提交数据] [formData:以formData方式提交数据]
 * @param String jsonp 调用jsonp服务,回调属性默认callback
 * @param String jsonpCallback jsonp回调函数名
 * @param Boolean async 异步/同步(默认true)
 * @param Number timeout 设置超时
 * @param Object headers 请求头
 * @param Function iterators(request, next(xhr)) 局部拦截器,继续执行;如果有值则结束执行并将结果返回 next({response : {...}, status : 200})
 */
export var setup = XEAjax.setup = function setup (options) {
  Object.assign(setupDefaults, options)
}

/**
 * 拦截器
 *
 * @param function (request, next)
 *  request 请求对象
 *  next Object 如果是对象值,则直接返回请求结果
 *    next({...}) 返回结果，状态200
 *    next({response : {...}, status : 500}) 支持状态自定义
 *  next Function 如果是函数,则在请求之后执行
 *    next(function (response) {return response}) 直接处理后的结果
 *    next(function (response) {response.status = 200}) 将状态修改
 */
export var interceptor = XEAjax.interceptor = {
  use: function (callback) {
    if (isFunction(callback)) {
      setupInterceptors.push(callback)
    }
    return interceptor
  }
}

interceptor.use(function (request, next) {
  if (!isFormData(request.method === 'get' ? request.params : request.body)) {
    if (request.bodyMode === 'json') {
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

export default XEAjax
