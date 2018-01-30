/*!
 * xe-ajax.js v2.6.2
 * (c) 2017-2018 Xu Liangzhan
 * ISC License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global.XEAjax = factory())
}(this, function () {
  'use strict'

  var isArray = Array.isArray || function (val) {
    return Object.prototype.toString.call(val) === '[object Array]'
  }

  function isFormData (obj) {
    return typeof FormData !== 'undefined' && obj instanceof FormData
  }

  function isCrossOrigin (request) {
    if (/(\w+:)\/{2}((.*?)\/|(.*)$)/.test(request.url)) {
      if (RegExp.$1 !== location.protocol || RegExp.$2.split('/')[0] !== location.host) {
        return true
      }
    }
    return false
  }

  function isObject (obj) {
    return obj && typeof obj === 'object'
  }

  function isString (obj) {
    return typeof obj === 'string'
  }

  function isFunction (obj) {
    return typeof obj === 'function'
  }

  function isUndefined (obj) {
    return typeof obj === 'undefined'
  }

  function eachObj (obj, iteratee, context) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        iteratee.call(context, obj[key], key, obj)
      }
    }
  }

  function parseParam (resultVal, resultKey, isArr) {
    var result = []
    eachObj(resultVal, function (item, key) {
      if (isObject(item)) {
        result = result.concat(parseParam(item, resultKey + '[' + key + ']', isArray(item)))
      } else {
        result.push(encodeURIComponent(resultKey + '[' + (isArr ? '' : key) + ']') + '=' + encodeURIComponent(item))
      }
    })
    return result
  }

  // Serialize Body
  function serialize (body) {
    var params = []
    eachObj(body, function (item, key) {
      if (item !== undefined) {
        if (isObject(item)) {
          params = params.concat(parseParam(item, key, isArray(item)))
        } else {
          params.push(encodeURIComponent(key) + '=' + encodeURIComponent(item))
        }
      }
    })
    return params.join('&').replace(/%20/g, '+')
  }

  function XEAjaxRequest (options) {
    Object.assign(this, {body: null, params: null}, options)
    this.ABORT_RESPONSE = undefined
    this.AFTER_SEND_CALLS = []
    this.OPTIONS = options
    this.method = String(this.method).toLocaleUpperCase()
    this.crossOrigin = isCrossOrigin(this)
    if (options && options.jsonp) {
      this.script = document.createElement('script')
    } else {
      this.xhr = options.getXMLHttpRequest(this)
    }
    setCancelableItem(this)
  }

  Object.assign(XEAjaxRequest.prototype, {
    abort: function (response) {
      this.xhr.abort(response)
    },
    setHeader: function (name, value) {
      this.headers[name] = value
    },
    getHeader: function () {
      return this.headers[name]
    },
    deleteHeader: function (name) {
      delete this.headers[name]
    },
    clearHeader: function () {
      this.headers = {}
    },
    getUrl: function () {
      var url = this.url
      var params = ''
      if (url) {
        if (this.params && !isFormData(this.params)) {
          params = isFunction(this.paramsSerializer) ? this.paramsSerializer(this) : serialize(this.params)
        }
        if (params) {
          url += (url.indexOf('?') === -1 ? '?' : '&') + params
        }
        if (/\w+:\/{2}.*/.test(url)) {
          return url
        }
        return this.baseURL.replace(/\/$/, '') + '/' + url.replace(/^\//, '')
      }
      return url
    },
    getBody: function () {
      var request = this
      return new Promise(function (resolve, reject) {
        var result = null
        if (request.body && request.method !== 'GET') {
          try {
            if (isFunction(request.transformBody)) {
              request.body = request.transformBody(request.body, request) || request.body
            }
            if (isFunction(request.stringifyBody)) {
              result = request.stringifyBody(request.body, request) || null
            } else {
              if (isFormData(request.body)) {
                result = request.body
              } else if (String(request.bodyType).toLocaleUpperCase() === 'FROM_DATA') {
                result = serialize(request.body)
              } else {
                result = JSON.stringify(request.body)
              }
            }
          } catch (e) {
            console.error(e)
          }
        }
        resolve(result)
      })
    }
  })

  function XEAjaxResponse (request, xhr) {
    this.request = request
    this.url = request.url
    this.headers = {}
    this.status = 0
    this.statusText = ''
    this.bodyText = ''

    // xhr handle
    if (xhr && xhr.response !== undefined && xhr.status !== undefined) {
      this.status = xhr.status || this.status

      this.body = xhr.response
      this.bodyText = xhr.responseText || ''

      // if no content
      if (this.status === 1223 || this.status === 204) {
        this.statusText = 'No Content'
      } else if (this.status === 304) {
      // if not modified
        this.statusText = 'Not Modified'
      } else {
      // statusText
        this.statusText = (xhr.statusText || this.statusText).trim()
      }

      // parse headers
      if (xhr.getAllResponseHeaders) {
        var allResponseHeaders = xhr.getAllResponseHeaders().trim()
        if (allResponseHeaders) {
          allResponseHeaders.split('\n').forEach(function (row) {
            var index = row.indexOf(':')
            this.headers[row.slice(0, index).trim()] = row.slice(index + 1).trim()
          }, this)
        }
      } else if (xhr.headers) {
        Object.assign(this.headers, xhr.headers)
      }
    } else if (xhr) {
      this.body = xhr
    }

    // stringify bodyText
    try {
      if (this.body && !this.bodyText) {
        this.bodyText = JSON.stringify(this.body)
      }
    } catch (e) {}

    // parse body
    if (this.body && isString(this.body)) {
      try {
        this.body = JSON.parse(this.body)
      } catch (e) {
        this.body = this.bodyText
      }
    }
  }

  Object.assign(XEAjaxResponse.prototype, {
    json: function () {
      return Promise.resolve(this.body)
    },
    test: function () {
      return Promise.resolve(this.bodyText)
    }
  })

  var global = typeof window === 'undefined' ? this : window
  var setupInterceptors = []
  var setupDefaults = {
    method: 'GET',
    baseURL: location.origin,
    async: true,
    credentials: true,
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
  function XEAjax (options) {
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
      if (request.timeout && !isNaN(request.timeout)) {
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
      if (request.credentials === 'include') {
        request.xhr.withCredentials = true
      } else if (request.credentials === 'omit') {
        request.xhr.withCredentials = false
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
    if (isFunction(request.sendJSONP)) {
      request.sendJSONP(script, request, resolve, reject)
    } else {
      document.body.appendChild(script)
    }
  }

  function jsonpHandle (request, xhr, resolve, reject) {
    var response = new XEAjaxResponse(request, xhr)
    delete global[request.jsonpCallback]
    if (isFunction(request.sendEndJSONP)) {
      request.sendEndJSONP(request.script, request)
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
   * @param String credentials 设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include(默认same-origin)
   * @param Number timeout 设置超时
   * @param Object headers 请求头
   * @param Function transformParams(request) 用于改变URL参数
   * @param Function paramsSerializer(request) 自定义URL序列化函数
   * @param Function transformBody(request) 用于改变提交数据
   * @param Function stringifyBody(request) 自定义转换提交数据的函数
   * @param Function interceptor(request, next(xhr)) 局部拦截器,继续执行;如果有值则结束执行并将结果返回 next({response : {...}, status : 200})
   */
  var setup = function setup (options) {
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
  var interceptor = {
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

  var requestList = []
  var cmdIndex = 0

  function XEAjaxCancelable () {
    this._ID = 'XEAjax_' + (++cmdIndex)
  }

  function promiseHandle (status) {
    return function (resp) {
      var xhr = {status: status, response: resp || ''}
      if (resp && resp.response !== undefined && resp.status !== undefined) {
        xhr = resp
      }
      cancelHandle.call(this, xhr)
    }
  }

  function cancelHandle (xhr) {
    var index = getIndex(this)
    if (index !== undefined) {
      requestList[index][1].forEach(function (request) {
        setTimeout(function () {
          request.abort(xhr)
        })
      })
      requestList.splice(index, 1)
    }
  }

  Object.assign(XEAjaxCancelable.prototype, {
    cancel: cancelHandle,
    resolve: promiseHandle(200),
    reject: promiseHandle(500)
  })

  function getIndex (item) {
    for (var index = 0, len = requestList.length; index < len; index++) {
      if (item === requestList[index][0]) {
        return index
      }
    }
  }

  function setCancelableItem (request) {
    var item = request.cancelable
    if (item && item.constructor === XEAjaxCancelable) {
      var index = getIndex(item)
      if (index === undefined) {
        requestList.push([item, [request]])
      } else {
        requestList[index][1].push(request)
      }
    }
  }

  function createAjax (method, def, opts) {
    return XEAjax(Object.assign({method: method}, def, opts))
  }

  // xhr response JSON
  function responseJSON (method) {
    return function () {
      return method.apply(this, arguments).then(function (response) {
        return response.body
      }).catch(function (response) {
        return Promise.reject(response.body, this)
      })
    }
  }

  // Http Request
  var ajax = XEAjax

  // Http Request All
  function doAll (iterable) {
    return Promise.all(iterable.map(function (item) {
      if (item instanceof Promise) {
        return item
      } else if (item && isObject(item)) {
        return ajax(item)
      }
      return item
    }))
  }

  // Http Request Method GET
  function doGet (url, params, opts) {
    return createAjax('GET', isObject(url) ? {} : {url: url, params: params}, opts)
  }

  // Http Request Method POST
  function doPost (url, body, opts) {
    return createAjax('POST', isObject(url) ? {} : {url: url, body: body}, opts)
  }

  // Http Request Method PUT
  function doPut (url, body, opts) {
    return createAjax('PUT', isObject(url) ? {} : {url: url, body: body}, opts)
  }

  // Http Request Method PATCH
  function doPatch (url, body, opts) {
    return createAjax('PATCH', isObject(url) ? {} : {url: url, body: body}, opts)
  }

  // Http Request Method DELETE
  function doDelete (url, body, opts) {
    return createAjax('DELETE', isObject(url) ? {} : {url: url, body: body}, opts)
  }

  // Http Request Method jsonp
  function jsonp (url, params, opts) {
    return createAjax('GET', {url: url, params: params, jsonp: 'callback'}, opts)
  }

  // promise cancelable
  function cancelable () {
    return new XEAjaxCancelable()
  }

  var getJSON = responseJSON(doGet)
  var postJSON = responseJSON(doPost)
  var putJSON = responseJSON(doPut)
  var patchJSON = responseJSON(doPatch)
  var deleteJSON = responseJSON(doDelete)

  /**
   * 函数扩展
   *
   * @param {Object} methods 扩展函数对象
   */
  function mixin (methods) {
    return Object.assign(XEAjax, methods)
  }

  /**
   * 安装插件
   */
  function use (plugin) {
    plugin.install(XEAjax)
  }

  mixin({
    doAll: doAll, doGet: doGet, getJSON: getJSON, doPost: doPost, postJSON: postJSON, doPut: doPut, putJSON: putJSON, doPatch: doPatch, patchJSON: patchJSON, doDelete: doDelete, deleteJSON: deleteJSON, jsonp: jsonp, cancelable: cancelable, setup: setup, interceptor: interceptor
  })
  XEAjax.use = use
  XEAjax.mixin = mixin

  return XEAjax
}))
