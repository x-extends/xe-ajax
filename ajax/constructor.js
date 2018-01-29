import XEAjaxRequest from './request'
import XEAjaxResponse from './response'
import { isFunction, isFormData, isUndefined, eachObj } from './util'

var setupInterceptors = []
var setupDefaults = {
  method: 'GET',
  baseURL: location.origin,
  async: true,
  bodyType: 'JSON_DATA',
  headers: {
    Accept: 'application/json, text/plain, */*;'
  },
  getXMLHttpRequest: function () {
    return new XMLHttpRequest()
  },
  getPromiseStatus: function (response) {
    return (response.status >= 200 && response.status < 300) || response.status === 304
  }
}

/**
  * XHR AJAX
  *
  * @param Object options 请求参数
  * @return Promise
  */
export function XEAjax (options) {
  return new Promise(function (resolve, reject) {
    return (options && options.jsonp ? sendJSONP : sendXHR)(new XEAjaxRequest(Object.assign({}, setupDefaults, {headers: Object.assign({}, setupDefaults.headers)}, options)), resolve, reject)
  })
}

function afterSendHandle (request, response) {
  var afterPromises = Promise.resolve(response)
  request.AFTER_SEND_CALLS.forEach(function (fn) {
    afterPromises = afterPromises.then(function (response) {
      return fn(response) || response
    }).catch(function (message) {
      console.error(message)
    })
  })
  return afterPromises
}

function sendEnd (request, response, resolve, reject) {
  afterSendHandle(request, response).then(function (response) {
    (request.OPTIONS.getPromiseStatus(response) ? resolve : reject)(response)
  })
}

function interceptorHandle (request) {
  var interceptorPromises = Promise.resolve()
  setupInterceptors.concat(request.interceptor ? [request.interceptor] : []).forEach(function (callback) {
    interceptorPromises = interceptorPromises.then(function (response) {
      if (response) {
        return response
      } else {
        return new Promise(function (resolve) {
          callback(request, function (response) {
            if (isUndefined(response)) {
              resolve()
            } else if (isFunction(response)) {
              request.AFTER_SEND_CALLS.push(response)
              resolve()
            } else {
              resolve(new XEAjaxResponse(request, response))
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

function sendXHR (request, resolve, reject) {
  var xhr = request.xhr
  interceptorHandle(request).then(function (response) {
    if (response && response.constructor === XEAjaxResponse) {
      return sendEnd(request, response, resolve, reject)
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
        sendEnd(request, new XEAjaxResponse(request, xhr), resolve, reject)
      }
    }
    request.getBody().then(function (body) {
      xhr.send(body)
    }).catch(function () {
      xhr.send()
    })
  })
}

var jsonpIndex = 0
function sendJSONP (request, resolve, reject) {
  var options = request.OPTIONS
  var script = request.script
  var url = request.getUrl()
  if (!request.jsonpCallback) {
    request.jsonpCallback = 'xeajax_jsonp' + (++jsonpIndex)
  }
  request.customCallback = global[request.jsonpCallback]
  global[request.jsonpCallback] = function (response) {
    jsonpHandle(request, {status: 200, response: response}, resolve, reject)
  }
  script.type = 'text/javascript'
  script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + request.jsonp + '=' + request.jsonpCallback
  script.onerror = function (evnt) {
    jsonpHandle(request, {status: 500, response: null}, resolve, reject)
  }
  if (isFunction(options.sendJSONP)) {
    options.sendJSONP(script, request, resolve, reject)
  } else {
    document.body.appendChild(script)
  }
}

function jsonpHandle (request, xhr, resolve, reject) {
  var options = request.OPTIONS
  var response = new XEAjaxResponse(request, xhr)
  delete global[request.jsonpCallback]
  if (isFunction(options.sendEndJSONP)) {
    options.sendEndJSONP(request.script, request)
  } else {
    document.body.removeChild(request.script)
  }
  if (request.customCallback) {
    (global[request.jsonpCallback] = request.customCallback)(response)
  }
  (request.OPTIONS.getPromiseStatus(xhr) ? resolve : reject)(response)
}

/**
 * 参数
 *
 * @param String url 请求地址
 * @param String baseURL 基础路径
 * @param String method 请求方法(默认GET)
 * @param Object params 请求参数
 * @param Object body 提交参数
 * @param String bodyType 提交参数方式(默认JSON_DATA) 支持[JSON_DATA:以json data方式提交数据] [FROM_DATA:以form data方式提交数据]
 * @param String jsonp 调用jsonp服务,回调属性默认callback
 * @param String jsonpCallback jsonp回调函数名(不建议使用，无意义)
 * @param Boolean async 异步/同步(默认true)
 * @param Number timeout 设置超时
 * @param Object headers 请求头
 * @param Function transformParams(request) 用于改变URL参数
 * @param Function paramsSerializer(request) 自定义URL序列化函数
 * @param Function transformBody(request) 用于改变提交数据
 * @param Function stringifyBody(request) 自定义转换提交数据的函数
 * @param Function interceptor(request, next(xhr)) 局部拦截器,继续执行;如果有值则结束执行并将结果返回 next({response : {...}, status : 200})
 */
export var setup = function setup (options) {
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
export var interceptor = {
  use: function (callback) {
    if (isFunction(callback)) {
      setupInterceptors.push(callback)
    }
    return interceptor
  }
}

interceptor.use(function (request, next) {
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

export default XEAjax
