import { XEAjaxRequest } from './request'
import { XEAjaxResponse } from './response'
import { XEPromise } from './promise'
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

/*
  * XHR AJAX
  *
  * @param Object options 请求参数
  * @param Object context 上下文对象(this默认指向当前vue组件)
  * @return Promise
  */
export function XEAjax (options, context) {
  return new XEPromise(function (resolved, rejected) {
    return (options && options.jsonp ? sendJSONP : sendXHR)(new XEAjaxRequest(Object.assign(setupDefaults, {headers: Object.assign({}, setupDefaults.headers)}, options)), resolved, rejected, XEAjax.context)
  }, XEAjax.context)
}

Object.assign(XEAjax, {

  context: window,

  /**
   * 函数扩展
   *
   * @param {Object} methods 扩展函数对象
   */
  mixin (methods) {
    Object.keys(methods).forEach(function (name) {
      var fn = methods[name]
      XEAjax[name] = typeof fn === 'function' ? function () {
        var rest = fn.apply(XEAjax.context || window, arguments)
        XEAjax.context = window
        return rest
      } : fn
    })
  }
})

Object.defineProperties(XEAjax, {

  /**
   * 拦截器
   *
   * @attribute function (request, next)
   * next({response : {...}, status : 200}) 如果是对象值,则不再中断并返回结果
   * next(function (response)) 如果是函数,则在请求之后执行
   */
  oninterceptor: {
    get: function () {
      return setupInterceptors
    },
    set: function (callback) {
      setupInterceptors.push(callback)
    }
  },

  /**
   * 参数
   *
   * @attribute String url 请求地址
   * @attribute String baseURL 基础路径
   * @attribute String method 请求方法(默认get)
   * @attribute Object params 请求参数
   * @attribute Object body 提交参数
   * @attribute String bodyMode 提交参数方式(默认json) 支持[json:以json方式提交数据] [formData:以formData方式提交数据]
   * @attribute String jsonp 调用jsonp服务,回调属性默认callback
   * @attribute String jsonpCallback jsonp回调函数名
   * @attribute Boolean async 异步/同步(默认true)
   * @attribute Number timeout 设置超时
   * @attribute Object headers 请求头
   * @attribute Function iterators(request, next(xhr)) 局部拦截器,继续执行;如果有值则结束执行并将结果返回 next({response : {...}, status : 200})
   */
  defaults: {
    get: function () {
      return setupDefaults
    },
    set: function (opts) {
      Object.assign(setupDefaults, opts)
    }
  }
})

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

// set request header
XEAjax.oninterceptor = function (request, next) {
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
}
