/*!
 * xe-ajax.js v3.0.10
 * (c) 2017-2018 Xu Liangzhan
 * ISC License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global.XEAjax = factory())
}(this, function () {
  'use strict'

  var isArray = Array.isArray || function (obj) {
    return obj ? obj.constructor === Array : false
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

  function isFunction (obj) {
    return typeof obj === 'function'
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

  var objectAssign = Object.assign || function (target) {
    for (var source, index = 1, len = arguments.length; index < len; index++) {
      source = arguments[index]
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          target[key] = source[key]
        }
      }
    }
    return target
  }

  function arrayEach (array, callback, context) {
    if (array.forEach) {
      array.forEach(callback, context)
    } else {
      for (var index = 0, len = array.length || 0; index < len; index++) {
        callback.call(context || global, array[index], index, array)
      }
    }
  }

  function toKey (key) {
    return String(key).toLowerCase()
  }

  function XEHeaders () {
    this._state = {}

    this.set = function (key, value) {
      this._state[toKey(key)] = [value]
    }

    this.get = function (key) {
      var _key = toKey(key)
      return this.has(_key) ? this._state[_key].join(', ') : null
    }

    this.append = function (key, value) {
      var _key = toKey(key)
      if (this.has(_key)) {
        return this._state[_key].push(value)
      } else {
        this.set(_key, value)
      }
    }

    this.has = function (key) {
      return !!this._state[toKey(key)]
    }

    this['delete'] = function (key) {
      delete this._state[toKey(key)]
    }
  }

  objectAssign(XEHeaders.prototype, {
    forEach: function (callback, context) {
      eachObj(this._state, function (value, key, state) {
        callback.call(context, value.join(', '), state)
      })
    }
  })

  var requestList = []

  /**
   * 索引 XHR Request 是否存在
   * @param { XEAjaxRequest } item 对象
   */
  function getIndex (item) {
    for (var index = 0, len = requestList.length; index < len; index++) {
      if (item === requestList[index][0]) {
        return index
      }
    }
  }

  /**
   * 将可取消的 XHR Request 放入队列
   *
   * @param { XEAjaxRequest } request 对象
   */
  function setFetchRequest (request) {
    if (request.signal) {
      var index = getIndex(request.signal)
      if (index === undefined) {
        requestList.push([request.signal, [request]])
      } else {
        requestList[index][1].push(request)
      }
    }
  }

  function XEFetchSignal () {}

  function XEFetchController () {
    this.signal = new XEFetchSignal()
  }

  objectAssign(XEFetchController.prototype, {
    // 中止请求
    abort: function () {
      var index = getIndex(this.signal)
      if (index !== undefined) {
        arrayEach(requestList[index][1], function (request) {
          setTimeout(function () {
            request.abort()
          })
        })
        requestList.splice(index, 1)
      }
    }
  })

  /**
   * 拦截器队列
   */
  const state = {request: [], response: []}

  function useInterceptors (calls) {
    return function (callback) {
      if (calls.indexOf(callback) === -1) {
        calls.push(callback)
      }
    }
  }

  function ResponseXHR (result) {
    try {
      var responseText = JSON.stringify(result.body)
    } catch (e) {
      responseText = ''
    }
    this.status = result.status
    this.responseHeaders = result.headers
    this.response = responseText
    this.responseText = responseText
  }

  objectAssign(ResponseXHR.prototype, {
    getAllResponseHeaders: function () {
      var result = ''
      var responseHeader = this.responseHeaders
      if (responseHeader) {
        for (var key in responseHeader) {
          if (responseHeader.hasOwnProperty(key)) {
            result += key + ': ' + responseHeader[key] + '\n'
          }
        }
      }
      return result
    }
  })

  /**
   * Request 拦截器
   */
  function requestInterceptor (data) {
    var thenInterceptor = Promise.resolve(data)
    arrayEach(state.request, function (callback) {
      thenInterceptor = thenInterceptor.then(function (request) {
        return new Promise(function (resolve) {
          callback(request, function () {
            resolve(request)
          })
        })
      }).catch(function (request) {
        console.error(request)
      })
    })
    return thenInterceptor
  }

  /**
   * Response 拦截器
   */
  function responseInterceptor (request, data) {
    var thenInterceptor = Promise.resolve(data)
    arrayEach(state.response, function (callback) {
      thenInterceptor = thenInterceptor.then(function (response) {
        return new Promise(function (resolve) {
          callback(response, function (result) {
            if (result && result.constructor !== XEAjaxResponse) {
              resolve(new XEAjaxResponse(request, new ResponseXHR(result)))
            } else {
              resolve(response)
            }
          })
        })
      }).catch(function (response) {
        console.error(response)
      })
    })
    return thenInterceptor
  }

  var interceptors = {
    request: {
      use: useInterceptors(state.request)
    },
    response: {
      use: useInterceptors(state.response)
    }
  }

  // 默认拦截器
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

  function XEAjaxRequest (options) {
    objectAssign(this, {url: '', body: null, params: null, signal: null}, options)
    this.ABORT_RESPONSE = undefined
    this.method = String(this.method).toLocaleUpperCase()
    this.crossOrigin = isCrossOrigin(this)
    if (options && options.jsonp) {
      this.script = document.createElement('script')
    } else {
      this.xhr = options.getXMLHttpRequest(this)
    }
    setFetchRequest(this)
  }

  objectAssign(XEAjaxRequest.prototype, {
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
        if (isFunction(this.transformParams)) {
          // 避免空值报错，params 始终保持是对象
          this.params = this.transformParams(this.params || {}, this)
        }
        if (this.params && !isFormData(this.params)) {
          params = isFunction(this.paramsSerializer) ? this.paramsSerializer(this.params, this) : serialize(this.params)
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
              // 避免空值报错，body 始终保持是对象
              request.body = request.transformBody(request.body || {}, request) || request.body
            }
            if (isFunction(request.stringifyBody)) {
              result = request.stringifyBody(request.body, request) || null
            } else {
              if (isFormData(request.body)) {
                result = request.body
              } else if (String(request.bodyType).toLocaleUpperCase() === 'FORM_DATA') {
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

  function XEReadableStream (xhr) {
    this.locked = false
    this._xhr = xhr
  }

  objectAssign(XEReadableStream.prototype, {
    _getBody: function () {
      var that = this
      var xhr = this._xhr
      return new Promise(function (resolve, reject) {
        var body = {responseText: '', response: xhr}
        if (xhr && xhr.response !== undefined && xhr.status !== undefined) {
          if (xhr.responseText) {
            body.responseText = xhr.responseText
            try {
              body.response = JSON.parse(xhr.responseText)
            } catch (e) {
              body.response = null
            }
          } else {
            body.response = xhr.response
            body.responseText = JSON.stringify(xhr.response)
          }
        } else {
          body.responseText = JSON.stringify(body.response)
        }
        if (that.locked) {
          reject(new TypeError('body stream already read'))
        } else {
          that.locked = true
          resolve(body)
        }
      })
    }
  })

  function XEAjaxResponse (request, xhr) {
    var that = this
    this.body = new XEReadableStream(xhr)
    this.bodyUsed = false
    this.url = request.url
    this.headers = new XEHeaders()
    this.status = 0
    this.statusText = ''
    this.ok = false
    this.redirected = false
    this.type = 'basic'

    this.json = function () {
      return this.body._getBody().then(function (body) {
        that.bodyUsed = true
        return body.response
      })
    }

    this.text = function () {
      return this.body._getBody().then(function (body) {
        that.bodyUsed = true
        return body.responseText
      })
    }

    // xhr handle
    if (xhr && xhr.response !== undefined && xhr.status !== undefined) {
      this.status = xhr.status
      this.redirected = this.status === 302
      this.ok = request.getPromiseStatus(this)

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
          arrayEach(allResponseHeaders.split('\n'), function (row) {
            var index = row.indexOf(':')
            this.headers.set(row.slice(0, index).trim(), row.slice(index + 1).trim())
          }, this)
        }
      }
    }
  }

  var global = typeof window === 'undefined' ? this : window
  var setupDefaults = {
    method: 'GET',
    baseURL: location.origin,
    async: true,
    credentials: 'same-origin',
    bodyType: 'JSON_DATA',
    headers: {
      Accept: 'application/json, text/plain, */*;'
    },
    getXMLHttpRequest: function () {
      return new XMLHttpRequest()
    },
    getPromiseStatus: function (response) {
      return response.status >= 200 && response.status < 300
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
      return (options && options.jsonp ? sendJSONP : sendXHR)(new XEAjaxRequest(objectAssign({}, setupDefaults, {headers: objectAssign({}, setupDefaults.headers)}, options)), resolve, reject)
    })
  }

  /**
   * 响应结束
   * @param { XEAjaxRequest } request 对象
   * @param { XHR } xhr 请求
   * @param { Promise.resolve } resolve 成功
   * @param { Promise.reject } reject 失败
   */
  function sendEnd (request, xhr, resolve, reject) {
    responseInterceptor(request, new XEAjaxResponse(request, xhr)).then(function (response) {
      resolve(response)
    })
  }

  /**
   * XHR 请求处理
   * @param { XHR } xhr 请求
   * @param { Promise.resolve } resolve 成功 Promise
   * @param { Promise.reject } reject 失败 Promise
   */
  function sendXHR (request, resolve, reject) {
    var xhr = request.xhr
    requestInterceptor(request).then(function () {
      xhr.open(request.method, request.getUrl(), request.async !== false)
      if (request.timeout && !isNaN(request.timeout)) {
        xhr.timeout = request.timeout
      }
      eachObj(request.headers, function (value, name) {
        xhr.setRequestHeader(name, value)
      })
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          sendEnd(request, xhr, resolve, reject)
        }
      }
      if (request.credentials === 'include') {
        xhr.withCredentials = true
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false
      }
      request.getBody().then(function (body) {
        xhr.send(body)
      }).catch(function () {
        xhr.send()
      })
    })
  }

  /**
   * jsonp 请求处理
   */
  var jsonpIndex = 0
  function sendJSONP (request, resolve, reject) {
    var script = request.script
    var url = request.getUrl()
    if (!request.jsonpCallback) {
      request.jsonpCallback = '_xeajax_jsonp' + (++jsonpIndex)
    }
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

  /**
   * jsonp 请求结果处理
   * @param { XEAjaxRequest } request 对象
   * @param { XHR } xhr 请求
   * @param { resolve } resolve 成功 Promise
   * @param { reject } reject 失败 Promise
   */
  function jsonpHandle (request, xhr, resolve, reject) {
    var response = new XEAjaxResponse(request, xhr)
    delete global[request.jsonpCallback]
    if (isFunction(request.sendEndJSONP)) {
      request.sendEndJSONP(request.script, request)
    } else {
      document.body.removeChild(request.script)
    }
    response.json().then(function (data) {
      (response.ok ? resolve : reject)(data)
    }).catch(function (data) {
      reject(data)
    })
  }

  /**
   * Request 对象
   *
   * @param String url 请求地址
   * @param String baseURL 基础路径
   * @param String method 请求方法(默认GET)
   * @param Object params 请求参数
   * @param Object body 提交参数
   * @param String bodyType 提交参数方式(默认JSON_DATA) 支持[JSON_DATA:以json data方式提交数据] [FORM_DATA:以form data方式提交数据]
   * @param String jsonp 调用jsonp服务,回调属性默认callback
   * @param Boolean async 异步/同步(默认true)
   * @param String credentials 设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include(默认same-origin)
   * @param Number timeout 设置超时
   * @param Object headers 请求头
   * @param Function transformParams(params, request) 用于改变URL参数
   * @param Function paramsSerializer(params, request) 自定义URL序列化函数
   * @param Function transformBody(body, request) 用于改变提交数据
   * @param Function stringifyBody(body, request) 自定义转换提交数据的函数
   * @param Function getXMLHttpRequest() 自定义 XMLHttpRequest 的函数
   * @param Function getPromiseStatus(response) 自定义请求成功判断条件
   */
  var setup = function setup (options) {
    objectAssign(setupDefaults, options)
  }

  function createAjax (method, def, options) {
    return XEAjax(objectAssign({method: method}, def, options))
  }

  // xhr response JSON
  function responseJSON (method) {
    return function () {
      return method.apply(this, arguments).then(function (response) {
        return new Promise(function (resolve, reject) {
          response.json().then(function (data) {
            (response.ok ? resolve : reject)(data)
          }).catch(function (data) {
            reject(data)
          })
        })
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
  function fetchGet (url, params, opts) {
    return createAjax('GET', isObject(url) ? {} : {url: url, params: params}, opts)
  }

  // Http Request Method POST
  function fetchPost (url, body, opts) {
    return createAjax('POST', isObject(url) ? {} : {url: url, body: body}, opts)
  }

  // Http Request Method PUT
  function fetchPut (url, body, opts) {
    return createAjax('PUT', isObject(url) ? {} : {url: url, body: body}, opts)
  }

  // Http Request Method PATCH
  function fetchPatch (url, body, opts) {
    return createAjax('PATCH', isObject(url) ? {} : {url: url, body: body}, opts)
  }

  // Http Request Method DELETE
  function fetchDelete (url, body, opts) {
    return createAjax('DELETE', isObject(url) ? {} : {url: url, body: body}, opts)
  }

  // Http Request Method jsonp
  function jsonp (url, params, opts) {
    return createAjax('GET', {url: url, params: params, jsonp: 'callback'}, opts)
  }

  var getJSON = responseJSON(fetchGet)
  var postJSON = responseJSON(fetchPost)
  var putJSON = responseJSON(fetchPut)
  var patchJSON = responseJSON(fetchPatch)
  var deleteJSON = responseJSON(fetchDelete)

  var AjaxController = XEFetchController
  var version = '3.0.10'

  var ajaxMethods = {
    doAll: doAll,
    fetchGet: fetchGet,
    getJSON: getJSON,
    fetchPost: fetchPost,
    postJSON: postJSON,
    fetchPut: fetchPut,
    putJSON: putJSON,
    fetchPatch: fetchPatch,
    patchJSON: patchJSON,
    fetchDelete: fetchDelete,
    deleteJSON: deleteJSON,
    jsonp: jsonp,
    setup: setup,
    serialize: serialize,
    interceptors: interceptors,
    AjaxController: AjaxController,
    version: version
  }

  /**
   * 混合函数
   *
   * @param {Object} methods 扩展
   */
  function mixin (methods) {
    return objectAssign(XEAjax, methods)
  }

  /**
   * 安装插件
   */
  function use (plugin) {
    plugin.install(XEAjax)
  }

  mixin(ajaxMethods)
  XEAjax.use = use
  XEAjax.mixin = mixin

  return XEAjax
}))
