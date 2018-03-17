/**
 * xe-ajax.js v3.2.7
 * (c) 2017-2018 Xu Liangzhan
 * ISC License.
 * @preserve
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
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

  function isSupportAdvanced () {
    return typeof Blob === 'function' && typeof FormData === 'function' && typeof FileReader === 'function'
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

  function arrayIncludes (array, value) {
    if (array.includes) {
      return array.includes(value)
    } else {
      for (var index = 0, len = array.length || 0; index < len; index++) {
        if (array[index] === value) {
          return true
        }
      }
    }
    return false
  }

  function clearXEAjaxContext (XEAjax) {
    XEAjax.$context = XEAjax.$Promise = null
  }

  function toKey (name) {
    return String(name).toLowerCase()
  }

  function getObjectIterators (obj, getIndex) {
    var result = []
    for (var name in obj) {
      if (obj.hasOwnProperty(name)) {
        var value = obj[name]
        result.push([name, value, [name, value]][getIndex])
      }
    }
    return result
  }

  function getIteratorResult (iterator, value) {
    var done = iterator.$index++ >= iterator.$list.length
    return { done: done, value: done ? undefined : value }
  }

  function XEIterator (iterator, value) {
    this.$index = 0
    this.$list = getObjectIterators(iterator, value)
    this.next = function () {
      return getIteratorResult(this, this.$list[this.$index])
    }
  }

  function $Headers (headers) {
    this._map = {}
    if (headers instanceof $Headers) {
      headers.forEach(function (value, name) {
        this.set(name, value)
      }, this)
    } else {
      objectEach(headers, function (value, name) {
        this.set(name, value)
      }, this)
    }
  }

  objectAssign($Headers.prototype, {
    set: function (name, value) {
      this._map[toKey(name)] = value
    },
    get: function (name) {
      var _key = toKey(name)
      return this.has(_key) ? this._map[_key] : null
    },
    append: function (name, value) {
      var _key = toKey(name)
      if (this.has(_key)) {
        this._map[_key] = this._map[_key] + ', ' + value
      } else {
        this._map[_key] = '' + value
      }
    },
    has: function (name) {
      return this._map.hasOwnProperty(toKey(name))
    },
    keys: function () {
      return new XEIterator(this._map, 0)
    },
    values: function () {
      return new XEIterator(this._map, 1)
    },
    entries: function () {
      return new XEIterator(this._map, 2)
    },
    'delete': function (name) {
      delete this._map[toKey(name)]
    },
    forEach: function (callback, context) {
      objectEach(this._map, function (value, name, state) {
        callback.call(context, value, name, this)
      }, this)
    }
  })

  var XEHeaders = typeof Headers === 'undefined' ? $Headers : Headers

  function XEReadableStream (body, request) {
    this.locked = false
    this._getBody = function () {
      var that = this
      var XEPromise = request.$Promise || Promise
      this.bodyUsed = true
      return new XEPromise(function (resolve, reject) {
        if (that.locked) {
          reject(new TypeError('body stream already read'))
        } else {
          that.locked = true
          resolve(body)
        }
      }, request.$context)
    }
  }

  var requestList = []

  function getSignalIndex (item) {
    for (var index = 0, len = requestList.length; index < len; index++) {
      if (item === requestList[index][0]) {
        return index
      }
    }
  }

  function $AbortSignal () {
    this.onaborted = null
    this._abortSignal = { aborted: false }
  }

  Object.defineProperty($AbortSignal.prototype, 'aborted', {
    get: function () {
      return this._abortSignal.aborted
    }
  })

  objectAssign($AbortSignal.prototype, {
    install: function (request) {
      if (request.signal) {
        var index = getSignalIndex(request.signal)
        if (index === undefined) {
          requestList.push([request.signal, [request]])
        } else {
          requestList[index][1].push(request)
        }
      }
    }
  })

  function $AbortController () {
    this.signal = new XEAbortSignal()
  }

  objectAssign($AbortController.prototype, {
    // Abort Request
    abort: function () {
      var index = getSignalIndex(this.signal)
      if (index !== undefined) {
        arrayEach(requestList[index][1], function (request) {
          request.abort()
          requestList[index][0]._abortSignal.aborted = true
        })
        requestList.splice(index, 1)
      }
    }
  })

  /* eslint-disable no-undef */
  var XEAbortSignal = $AbortSignal
  var XEAbortController = $AbortController

  /**
   * Interceptor Queue
   */
  var state = { reqQueue: [], respQueue: [] }

  function useInterceptors (calls) {
    return function (callback) {
      if (calls.indexOf(callback) === -1) {
        calls.push(callback)
      }
    }
  }

  /**
   * Request Interceptor
   */
  function requestInterceptor (request) {
    var XEPromise = request.$Promise || Promise
    var thenInterceptor = XEPromise.resolve(request, request.$context)
    arrayEach(state.reqQueue, function (callback) {
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
   * Response Interceptor
   */
  function responseInterceptor (request, response) {
    var XEPromise = request.$Promise || Promise
    var thenInterceptor = XEPromise.resolve(response, request.$context)
    arrayEach(state.respQueue, function (callback) {
      thenInterceptor = thenInterceptor.then(function (response) {
        return new XEPromise(function (resolve) {
          callback(response, function (resp) {
            if (resp && resp.body && resp.status) {
              resolve(toResponse(resp, request))
            } else {
              resolve(response)
            }
          }, request)
        }, request.$context)
      }).catch(function (resp) {
        console.error(resp)
      })
    })
    return thenInterceptor
  }

  var interceptors = {
    request: {
      use: useInterceptors(state.reqQueue)
    },
    response: {
      use: useInterceptors(state.respQueue)
    }
  }

  // default interceptor
  interceptors.request.use(function (request, next) {
    if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
      request.headers.set('Content-Type', 'application/x-www-form-urlencoded')
      if (!isFormData(request.body) && (request.bodyType === 'json-data' || request.bodyType === 'json_data')) {
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
    this.bodyType = String(this.bodyType).toLowerCase()
    this.crossOrigin = isCrossOrigin(this)
    if (this.signal && isFunction(this.signal.install)) {
      this.signal.install(this)
    }
  }

  objectAssign(XERequest.prototype, {
    abort: function () {
      if (this.xhr) {
        this.xhr.abort()
      }
      this.$abort = true
    },
    getUrl: function () {
      var url = this.url
      var params = ''
      if (url) {
        if (isFunction(this.transformParams)) {
          this.params = this.transformParams(this.params || {}, this)
        }
        if (this.params && !isFormData(this.params)) {
          params = (isFunction(this.paramsSerializer) ? this.paramsSerializer : serialize)(objectAssign(arrayIncludes(['no-store', 'no-cache', 'reload'], this.cache) ? { _: Date.now() } : {}, this.params), this)
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
              request.body = request.transformBody(request.body || {}, request) || request.body
            }
            if (isFunction(request.stringifyBody)) {
              result = request.stringifyBody(request.body, request) || null
            } else {
              if (isFormData(request.body)) {
                result = request.body
              } else if (request.bodyType === 'form-data' || request.bodyType === 'form_data') {
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

  function XEResponse (body, options, request) {
    this._request = request
    this._response = {
      body: new XEReadableStream(body, request),
      bodyUsed: false,
      url: request.url,
      status: options.status,
      statusText: options.statusText,
      redirected: options.status === 302,
      headers: new XEHeaders(options.headers || {}),
      type: 'basic'
    }
    this._response.ok = request.validateStatus(this)
  }

  arrayEach(['body', 'bodyUsed', 'url', 'headers', 'status', 'statusText', 'ok', 'redirected', 'type'], function (name) {
    Object.defineProperty(XEResponse.prototype, name, {
      get: function () {
        return this._response[name]
      }
    })
  })

  objectAssign(XEResponse.prototype, {
    clone: function () {
      return new XEResponse(this.body, { status: this.status, statusText: this.statusText, headers: this.headers }, this._request)
    },
    json: function () {
      return this.text().then(function (text) {
        return JSON.parse(text)
      })
    },
    text: function () {
      return this.body._getBody()
    }
  })

  if (isSupportAdvanced()) {
    objectAssign(XEResponse.prototype, {
      text: function () {
        var request = this._request
        return this.blob().then(function (blob) {
          var fileReader = new FileReader()
          var result = fileReaderReady(request, fileReader)
          fileReader.readAsText(blob)
          return result
        })
      },
      blob: function () {
        return this.body._getBody()
      },
      arrayBuffer: function () {
        var request = this._request
        return this.blob().then(function (blob) {
          var fileReader = new FileReader()
          var result = fileReaderReady(request, fileReader)
          fileReader.readAsArrayBuffer(blob)
          return result
        })
      },
      formData: function () {
        return this.text().then(function (text) {
          var formData = new FormData()
          text.trim().split('&').forEach(function (bytes) {
            if (bytes) {
              var split = bytes.split('=')
              var name = split.shift().replace(/\+/g, ' ')
              var value = split.join('=').replace(/\+/g, ' ')
              formData.append(decodeURIComponent(name), decodeURIComponent(value))
            }
          })
          return formData
        })
      }
    })
  }

  function fileReaderReady (request, reader) {
    var XEPromise = request.$Promise || Promise
    return new XEPromise(function (resolve, reject) {
      reader.onload = function () {
        resolve(reader.result)
      }
      reader.onerror = function () {
        reject(reader.error)
      }
    }, request.$context)
  }

  // Result to Response
  function toResponse (resp, request) {
    if ((typeof Response === 'function' && resp.constructor === Response) || resp.constructor === XEResponse) {
      return resp
    }
    var options = { status: resp.status, statusText: resp.statusText, headers: resp.headers }
    if (isSupportAdvanced()) {
      return new XEResponse(resp.body instanceof Blob ? resp.body : new Blob([JSON.stringify(resp.body)]), options, request)
    }
    return new XEResponse(JSON.stringify(resp.body), options, request)
  }

  function sendFetch (request, resolve, reject) {
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
          responseInterceptor(request, new TypeError('Network request failed')).then(reject)
        }, request.timeout)
      }
      $fetch(request.getUrl(), options).then(function (resp) {
        responseInterceptor(request, toResponse(resp, request)).then(resolve)
      }).catch(function (resp) {
        responseInterceptor(request, new TypeError('Network request failed')).then(reject)
      })
    })
  }

  function sendXHR (request, resolve, reject) {
    var $XMLHttpRequest = isFunction(request.$XMLHttpRequest) ? request.$XMLHttpRequest : XMLHttpRequest
    var xhr = request.xhr = new $XMLHttpRequest()
    xhr._request = request
    xhr.open(request.method, request.getUrl(), true)
    if (request.timeout) {
      setTimeout(function () {
        xhr.abort()
      }, request.timeout)
    }
    request.headers.forEach(function (value, name) {
      xhr.setRequestHeader(name, value)
    })
    xhr.onload = function () {
      responseInterceptor(request, new XEResponse(xhr.response, {
        status: xhr.status,
        statusText: parseStatusText(xhr),
        headers: parseXHRHeaders(xhr)
      }, request)).then(resolve)
    }
    xhr.onerror = function () {
      responseInterceptor(request, new TypeError('Network request failed')).then(reject)
    }
    xhr.ontimeout = function () {
      responseInterceptor(request, new TypeError('Network request failed')).then(reject)
    }
    if (isSupportAdvanced()) {
      xhr.responseType = 'blob'
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

  function createRequestFactory () {
    if (self.fetch) {
      return function (request, resolve, reject) {
        return (request.signal ? sendXHR : sendFetch).apply(this, arguments)
      }
    }
    return sendXHR
  }

  var sendRequest = createRequestFactory()

  /**
   * fetch 异步请求
   * @param { XHR } xhr 请求
   * @param { Promise.resolve } resolve 成功 Promise
   * @param { Promise.reject } reject 失败 Promise
   */
  function fetchRequest (request, resolve, reject) {
    return requestInterceptor(request).then(function () {
      return sendRequest(request, resolve, reject)
    })
  }

  function parseXHRHeaders (options) {
    var headers = {}
    if (options.getAllResponseHeaders) {
      var allResponseHeaders = options.getAllResponseHeaders().trim()
      if (allResponseHeaders) {
        arrayEach(allResponseHeaders.split('\n'), function (row) {
          var index = row.indexOf(':')
          headers[row.slice(0, index).trim()] = row.slice(index + 1).trim()
        })
      }
    }
    return headers
  }

  function parseStatusText (options) {
    if (options.status === 1223 || options.status === 204) {
      return 'No Content'
    } else if (options.status === 304) {
      return 'Not Modified'
    } else if (options.status === 404) {
      return 'Not Found'
    }
    return (options.statusText || options.statusText || '').trim()
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
  function sendJSONP (request, resolve, reject) {
    request.script = document.createElement('script')
    requestInterceptor(request).then(function () {
      var script = request.script
      if (!request.jsonpCallback) {
        request.jsonpCallback = 'jsonp_xeajax_' + Date.now() + '_' + (++jsonpIndex)
      }
      if (isFunction(request.$jsonp)) {
        return request.$jsonp(script, request).then(function (resp) {
          responseInterceptor(request, toResponse(resp, request)).then(resolve)
        })
      } else {
        var url = request.getUrl()
        $global[request.jsonpCallback] = function (body) {
          jsonpHandle(request, { status: 200, body: body }, resolve, reject)
        }
        script.type = 'text/javascript'
        script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + request.jsonp + '=' + request.jsonpCallback
        script.onerror = function (evnt) {
          jsonpHandle(request, { status: 500, body: null }, resolve, reject)
        }
        script.onabort = function (evnt) {
          jsonpHandle(request, { status: 0, body: null }, resolve, reject)
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
    cache: 'default',
    credentials: 'same-origin',
    bodyType: 'json-data',
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
   * @param String bodyType 提交参数方式可以设置json-data,form-data(json-data)
   * @param String jsonp 调用jsonp服务,回调属性默认callback
   * @param String cache 处理缓存方式,可以设置default,no-store,no-cache,reload,force-cache,only-if-cached(默认default)
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
      return XEAjax(method.apply(this, arguments))
    }
  }

  // xhr response JSON
  function responseJSON (method) {
    return function () {
      var opts = method.apply(this, arguments)
      var XEPromise = opts.$Promise || Promise
      return XEAjax(opts).then(function (response) {
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
        return XEAjax(objectAssign({ $context: context, $Promise: XEPromise }, item))
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

  var AbortController = XEAbortController

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

  var exportMethods = {
    doAll: doAll,
    ajax: ajax,
    fetch: function (url, options) {
      return fetchGet(url, null, options)
    },
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
    version: '3.2.7',
    $name: 'XEAjax'
  })

  mixin(exportMethods)

  return XEAjax
}))
