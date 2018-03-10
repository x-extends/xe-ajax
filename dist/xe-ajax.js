/**
 * xe-ajax.js v3.2.1
 * (c) 2017-2018 Xu Liangzhan
 * ISC License.
 * @preserve
 */
(function (global, factory) {
  typeof s === 'object' && typeof module !== 'undefined' ? module.s = factory()
    : typeof define === 'function' && define.amd ? define(factory)
      : (global.XEAjax = factory())
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

  function isString (obj) {
    return typeof obj === 'string'
  }

  function isObject (obj) {
    return obj && typeof obj === 'object'
  }

  function isFunction (obj) {
    return typeof obj === 'function'
  }

  function getLocatOrigin () {
    return location.origin || (location.protocol + '//' + location.host)
  }

  function getBaseURL () {
    var pathname = location.pathname
    var lastIndex = lastIndexOf(pathname, '/') + 1
    return getLocatOrigin() + (lastIndex === pathname.length ? pathname : pathname.substring(0, lastIndex))
  }

  function lastIndexOf (str, val) {
    if (isFunction(str.lastIndexOf)) {
      return str.lastIndexOf(val)
    } else {
      for (var len = str.length - 1; len >= 0; len--) {
        if (val === str[len]) {
          return len
        };
      }
    }
    return -1
  }

  function objectEach (obj, iteratee, context) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        iteratee.call(context, obj[key], key, obj)
      }
    }
  }

  function parseParam (resultVal, resultKey, isArr) {
    var result = []
    objectEach(resultVal, function (item, key) {
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
    objectEach(body, function (item, key) {
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
        callback.call(context, array[index], index, array)
      }
    }
  }

  function clearXEAjaxContext (XEAjax) {
    XEAjax.$context = XEAjax.$Promise = null
  }

  function toKey (key) {
    return String(key).toLowerCase()
  }

  function getObjectIterators (obj, getIndex) {
    var result = []
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var value = obj[key]
        result.push([key, value.join(', '), [key, value.join(', ')]][getIndex])
      }
    }
    return result
  }

  function getIteratorResult (iterator, value) {
    var done = iterator.$index++ >= iterator.$list.length
    return { done: done, value: done ? undefined : value }
  }

  function XEIterator (list) {
    this.$index = 0
    this.$list = list
    this.next = function () {
      return getIteratorResult(this, this.$list[this.$index])
    }
  }

  var XEHeaders = typeof Headers === 'function' ? Headers : function (heads) {
    var $state = {}

    this.set = function (key, value) {
      $state[toKey(key)] = [value]
    }

    this.get = function (key) {
      var _key = toKey(key)
      return this.has(_key) ? $state[_key].join(', ') : null
    }

    this.append = function (key, value) {
      var _key = toKey(key)
      if (this.has(_key)) {
        return $state[_key].push(value)
      } else {
        this.set(_key, value)
      }
    }

    this.has = function (key) {
      return !!$state[toKey(key)]
    }

    this.keys = function () {
      return new XEIterator(getObjectIterators($state, 0))
    }

    this.values = function () {
      return new XEIterator(getObjectIterators($state, 1))
    }

    this.entries = function () {
      return new XEIterator(getObjectIterators($state, 2))
    }

    this['delete'] = function (key) {
      delete $state[toKey(key)]
    }

    this.forEach = function (callback, context) {
      objectEach($state, function (value, key, state) {
        callback.call(context, value.join(', '), key, this)
      }, this)
    }

    if (heads instanceof XEHeaders) {
      heads.forEach(function (value, key) {
        this.set(key, value)
      }, this)
    } else {
      objectEach(heads, function (value, key) {
        this.set(key, value)
      }, this)
    }
  }

  var requestList = []

  /**
   * 索引 XHR Request 是否存在
   * @param { XERequest } item 对象
   */
  function getIndex (item) {
    for (var index = 0, len = requestList.length; index < len; index++) {
      if (item === requestList[index][0]) {
        return index
      }
    }
  }

  function XEAbortSignal () {
    var $signal = { aborted: false }
    Object.defineProperty(this, 'aborted', {
      get: function () {
        return $signal.aborted
      }
    })
  }

  objectAssign(XEAbortSignal.prototype, {
    // 将 Request 注入控制器
    install: function (request) {
      if (request.signal) {
        var index = getIndex(request.signal)
        if (index === undefined) {
          requestList.push([request.signal, [request]])
        } else {
          requestList[index][1].push(request)
        }
      }
    }
  })

  function XEAbortController () {
    this.signal = new XEAbortSignal()
  }

  objectAssign(XEAbortController.prototype, {
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
  var state = { request: [], response: [] }

  function useInterceptors (calls) {
    return function (callback) {
      if (calls.indexOf(callback) === -1) {
        calls.push(callback)
      }
    }
  }

  /**
   * Request 拦截器
   */
  function requestInterceptor (request) {
    var XEPromise = request.$Promise || Promise
    var thenInterceptor = XEPromise.resolve(request, request.$context)
    arrayEach(state.request, function (callback) {
      thenInterceptor = thenInterceptor.then(function (req) {
        return new XEPromise(function (resolve) {
          callback(req, function () {
            resolve(req)
          })
        }, request.$context)
      }).catch(function (req) {
        console.error(req)
      })
    })
    return thenInterceptor
  }

  /**
   * Response 拦截器
   */
  function responseInterceptor (request, response) {
    var XEPromise = request.$Promise || Promise
    var thenInterceptor = XEPromise.resolve(response, request.$context)
    arrayEach(state.response, function (callback) {
      thenInterceptor = thenInterceptor.then(function (resp) {
        return new XEPromise(function (resolve) {
          callback(resp, function (result) {
            if (result && result.constructor !== XEResponse) {
              resolve(new XEResponse(request, new ResponseXHR(result)))
            } else {
              resolve(resp)
            }
          })
        }, request.$context)
      }).catch(function (resp) {
        console.error(resp)
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
    if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
      request.headers.set('Content-Type', 'application/x-www-form-urlencoded')
      if (!isFormData(request.body) && request.bodyType === 'JSON_DATA') {
        request.headers.set('Content-Type', 'application/json; charset=utf-8')
      }
    }
    if (request.crossOrigin) {
      request.headers.set('X-Requested-With', 'XMLHttpRequest')
    }
    next()
  })

  function XERequest (options) {
    objectAssign(this, { url: '', body: null, params: null, signal: null }, options)
    this.headers = new XEHeaders(options.headers)
    this.method = String(this.method).toLocaleUpperCase()
    this.bodyType = String(this.bodyType).toLocaleUpperCase()
    this.crossOrigin = isCrossOrigin(this)
    if (this.signal && isFunction(this.signal.install)) {
      this.signal.install(this)
    }
  }

  objectAssign(XERequest.prototype, {
    abort: function (response) {
      this.xhr.abort(response)
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
        if (url.indexOf('/') === 0) {
          return getLocatOrigin() + url
        }
        return this.baseURL.replace(/\/$/, '') + '/' + url
      }
      return url
    },
    getBody: function () {
      var request = this
      var XEPromise = request.$Promise || Promise
      return new XEPromise(function (resolve, reject) {
        var result = null
        if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
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
      }, request.$context)
    }
  })

  function getResponse (request, result) {
    if (result) {
      if (typeof Response === 'undefined') {
        if (result.constructor === XEResponse) {
          return result
        }
      } else if (result.constructor === Response || result.constructor === XEResponse) {
        return result
      }
    }
    return new XEResponse(request, new ResponseXHR(result))
  }

  function responseComplete (request, result, complete) {
    request.$complete = true
    responseInterceptor(request, getResponse(request, result)).then(function (response) {
      complete(response)
    })
  }

  function ResponseXHR (result) {
    try {
      var responseText = isString(result.body) ? result.body : JSON.stringify(result.body)
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

  function XEReadableStream (xhr, request) {
    this.locked = false
    this._xhr = xhr
    this._request = request
  }

  objectAssign(XEReadableStream.prototype, {
    _getBody: function () {
      var that = this
      var xhr = this._xhr
      var request = this._request
      var XEPromise = request.$Promise || Promise
      return new XEPromise(function (resolve, reject) {
        var body = { responseText: '', response: xhr }
        if (xhr && xhr.response !== undefined && xhr.status !== undefined) {
          if (xhr.responseText) {
            body.responseText = xhr.responseText
            try {
              body.response = JSON.parse(xhr.responseText)
            } catch (e) {
              reject(new TypeError(e))
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
      }, request.$context)
    }
  })

  function XEResponse (request, xhr) {
    var that = this
    var $resp = {}

    $resp.body = new XEReadableStream(xhr, request)
    $resp.bodyUsed = false
    $resp.url = request.url
    $resp.headers = new XEHeaders()
    $resp.status = 0
    $resp.statusText = ''
    $resp.ok = false
    $resp.redirected = false
    $resp.type = 'basic'

    arrayEach(['body', 'bodyUsed', 'url', 'headers', 'status', 'statusText', 'ok', 'redirected', 'type'], function (name) {
      Object.defineProperty(that, name, {
        get: function () {
          return $resp[name]
        }
      })
    })

    this.json = function () {
      return this.body._getBody().then(function (body) {
        $resp.bodyUsed = true
        return body.response
      })
    }

    this.text = function () {
      return $resp.body._getBody().then(function (body) {
        $resp.bodyUsed = true
        return body.responseText
      })
    }

    // xhr handle
    if (xhr && xhr.response !== undefined && xhr.status !== undefined) {
      $resp.status = xhr.status
      $resp.redirected = $resp.status === 302
      $resp.ok = request.validateStatus(this)

      // if no content
      if ($resp.status === 1223 || $resp.status === 204) {
        $resp.statusText = 'No Content'
      } else if ($resp.status === 304) {
        // if not modified
        $resp.statusText = 'Not Modified'
      } else if ($resp.status === 404) {
        // if not found
        $resp.statusText = 'Not Found'
      } else {
        // statusText
        $resp.statusText = (xhr.statusText || $resp.statusText).trim()
      }

      // parse headers
      if (xhr.getAllResponseHeaders) {
        var allResponseHeaders = xhr.getAllResponseHeaders().trim()
        if (allResponseHeaders) {
          arrayEach(allResponseHeaders.split('\n'), function (row) {
            var index = row.indexOf(':')
            $resp.headers.set(row.slice(0, index).trim(), row.slice(index + 1).trim())
          })
        }
      }
    }
  }

  /**
   * fetch 异步请求
   * @param { XHR } xhr 请求
   * @param { Promise.resolve } resolve 成功 Promise
   * @param { Promise.reject } reject 失败 Promise
   */
  function fetchRequest (request, resolve, reject) {
    requestInterceptor(request).then(function () {
      if (!request.signal && typeof fetch === 'function') {
        var $fetch = isFunction(request.$fetch) ? request.$fetch : fetch
        request.getBody().then(function (body) {
          var options = {
            _request: request,
            method: request.method,
            credentials: request.credentials,
            body: body,
            headers: request.headers
          }
          if (request.timeout) {
            setTimeout(function () {
              responseComplete(request, { status: 0, body: '' }, resolve)
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
            responseComplete(request, { status: 0, body: '' }, resolve)
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
        request.getBody().then(function (body) {
          xhr.send(body)
        }).catch(function () {
          xhr.send()
        })
      }
    })
  }

  var jsonpIndex = 0
  var $global = typeof window === 'undefined' ? this : window

  /**
   * jsonp 请求结果处理
   * @param { XERequest } request 对象
   * @param { XHR } xhr 请求
   * @param { resolve } resolve 成功 Promise
   * @param { reject } reject 失败 Promise
   */
  function jsonpHandle (request, xhr, resolve, reject) {
    if (request.script.parentNode === document.body) {
      document.body.removeChild(request.script)
    }
    delete $global[request.jsonpCallback]
    responseComplete(request, xhr, resolve)
  }

  /**
   * jsonp 异步请求
   */
  function sendJSONP (request, resolve, reject) {
    request.script = document.createElement('script')
    requestInterceptor(request).then(function () {
      var script = request.script
      if (!request.jsonpCallback) {
        request.jsonpCallback = '_xeajax_jsonp' + (++jsonpIndex)
      }
      if (isFunction(request.$jsonp)) {
        return new Promise(function (resolve, reject) {
          request.$jsonp(script, request, resolve, reject)
        }).then(function (resp) {
          responseComplete(request, resp, resolve)
        }).catch(function (resp) {
          responseComplete(request, resp, reject)
        })
      } else {
        var url = request.getUrl()
        $global[request.jsonpCallback] = function (body) {
          jsonpHandle(request, { status: 200, body: body }, resolve, reject)
        }
        script.type = 'text/javascript'
        script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + request.jsonp + '=' + request.jsonpCallback
        script.onerror = function (evnt) {
          jsonpHandle(request, { status: 500, body: '' }, resolve, reject)
        }
        script.onabort = function (evnt) {
          jsonpHandle(request, { status: 500, body: '' }, resolve, reject)
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

  var setupDefaults = {
    method: 'GET',
    baseURL: getBaseURL(),
    credentials: 'same-origin',
    bodyType: 'JSON_DATA',
    log: 'development' !== 'production',
    headers: {
      Accept: 'application/json, text/plain, */*;'
    },
    validateStatus: function (response) {
      return response.status >= 200 && response.status < 300
    }
  }

  /**
    * 支持 xhr、fetch、jsonp
    *
    * @param Object options 请求参数
    * @return Promise
    */
  function XEAjax (options) {
    var opts = objectAssign({}, setupDefaults, { headers: objectAssign({}, setupDefaults.headers) }, options)
    var XEPromise = opts.$Promise || Promise
    return new XEPromise(function (resolve, reject) {
      return (opts.jsonp ? sendJSONP : fetchRequest)(new XERequest(opts), resolve, reject)
    }, opts.$context)
  }

  /**
   * Request 对象
   *
   * 参数
   * @param String url 请求地址
   * @param String baseURL 基础路径，默认上下文路径
   * @param String method 请求方法(默认GET)
   * @param Object params 请求参数，序列化后会拼接在url
   * @param Object body 提交参数
   * @param String bodyType 提交参数方式(默认JSON_DATA) 支持[JSON_DATA:以json data方式提交数据] [FORM_DATA:以form data方式提交数据]
   * @param String jsonp 调用jsonp服务,回调属性默认callback
   * @param String credentials 设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include(默认same-origin)
   * @param Number timeout 设置超时
   * @param Object headers 请求头
   * @param Boolean log 控制台输出日志
   * @param Function transformParams(params, request) 用于改变URL参数
   * @param Function paramsSerializer(params, request) 自定义URL序列化函数
   * @param Function transformBody(body, request) 用于改变提交数据
   * @param Function stringifyBody(body, request) 自定义转换提交数据的函数
   * @param Function validateStatus(response) 自定义校验请求是否成功
   * 高级扩展
   * @param Function $XMLHttpRequest 自定义 XMLHttpRequest 请求函数
   * @param Function $fetch 自定义 fetch 请求函数
   * @param Function $jsonp 自定义 jsonp 处理函数
   * @param Function $Promise 自定义 Promise 函数
   * @param Function $context 自定义上下文
   */
  var setup = function setup (options) {
    objectAssign(setupDefaults, options)
  }

  function getOptions (method, def, options) {
    var opts = objectAssign({ method: method, $context: XEAjax.$context, $Promise: XEAjax.$Promise }, def, options)
    clearXEAjaxContext(XEAjax)
    return opts
  }

  function responseResult (method) {
    return function () {
      return ajax(method.apply(this, arguments))
    }
  }

  // xhr response JSON
  function responseJSON (method) {
    return function () {
      var opts = method.apply(this, arguments)
      var XEPromise = opts.$Promise || Promise
      return ajax(opts).then(function (response) {
        return new XEPromise(function (resolve, reject) {
          response.json().then(function (data) {
            (response.ok ? resolve : reject)(data)
          }).catch(function (data) {
            reject(data)
          })
        }, this)
      })
    }
  }

  // Http Request
  var ajax = XEAjax

  // Http Request All
  function doAll (iterable) {
    var XEPromise = XEAjax.$Promise || Promise
    var context = XEAjax.$context
    clearXEAjaxContext(XEAjax)
    return XEPromise.all(iterable.map(function (item) {
      if (item instanceof XEPromise) {
        return item
      } else if (item && isObject(item)) {
        return ajax(objectAssign({ $context: context, $Promise: XEPromise }, item))
      }
      return item
    }), context)
  }

  function requestFn (method, defs) {
    return function (url, params, opts) {
      return getOptions(method, isObject(url) ? url : objectAssign({ url: url, params: params }, defs), opts)
    }
  }

  var requests = {
    HEAD: requestFn('HEAD'),
    GET: requestFn('GET'),
    JSONP: requestFn('GET', { jsonp: 'callback' })
  }
  arrayEach(['POST', 'PUT', 'DELETE', 'PATCH'], function (method) {
    requests[method] = function (url, body, opts) {
      return getOptions(method, isObject(url) ? url : { url: url, body: body }, opts)
    }
  })

  var fetchHead = responseResult(requests.HEAD)
  var fetchGet = responseResult(requests.GET)
  var fetchPost = responseResult(requests.POST)
  var fetchPut = responseResult(requests.PUT)
  var fetchDelete = responseResult(requests.DELETE)
  var fetchPatch = responseResult(requests.PATCH)
  var fetchJsonp = responseResult(requests.JSONP)

  var headJSON = responseJSON(requests.HEAD)
  var getJSON = responseJSON(requests.GET)
  var postJSON = responseJSON(requests.POST)
  var putJSON = responseJSON(requests.PUT)
  var deleteJSON = responseJSON(requests.DELETE)
  var patchJSON = responseJSON(requests.PATCH)
  var jsonp = responseJSON(requests.JSONP)

  var Methods = {
    doAll: doAll,
    ajax: ajax,
    fetchGet: fetchGet,
    fetchPost: fetchPost,
    fetchPut: fetchPut,
    fetchDelete: fetchDelete,
    fetchPatch: fetchPatch,
    fetchHead: fetchHead,
    fetchJsonp: fetchJsonp,
    getJSON: getJSON,
    postJSON: postJSON,
    putJSON: putJSON,
    deleteJSON: deleteJSON,
    patchJSON: patchJSON,
    headJSON: headJSON,
    jsonp: jsonp
  }

  var AbortController = XEAbortController

  /**
   * 混合函数
   *
   * @param {Object} methods 扩展
   */
  function mixin (methods) {
    objectEach(methods, function (fn, name) {
      XEAjax[name] = isFunction(fn) ? function () {
        var result = fn.apply(XEAjax.$context, arguments)
        clearXEAjaxContext(XEAjax)
        return result
      } : fn
    })
  }

  /**
   * 安装插件
   */
  function use (plugin) {
    plugin.install(XEAjax)
    if (setupDefaults.log) {
      console.info('[' + XEAjax.$name + '] Ready. Detected ' + plugin.$name + ' v' + plugin.version)
    }
  }

  objectAssign(XEAjax, {
    use: use,
    setup: setup,
    mixin: mixin,
    AbortController: AbortController,
    serialize: serialize,
    interceptors: interceptors,
    version: '3.2.1',
    $name: 'XEAjax'
  })

  mixin(Methods)

  return XEAjax
}))
