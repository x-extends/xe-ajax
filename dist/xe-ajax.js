/**
 * xe-ajax.js v3.4.3
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

  var encode = encodeURIComponent
  var isNodeJS = typeof window === 'undefined' && typeof process !== 'undefined'
  var utils = {

    _N: isNodeJS, // nodejs 环境
    _F: isNodeJS ? false : !!self.fetch, // 支持 fetch
    _A: !(typeof Blob === 'undefined' || typeof FormData === 'undefined' || typeof FileReader === 'undefined'), // IE10+ 支持Blob

    isFormData: function (obj) {
      return typeof FormData !== 'undefined' && obj instanceof FormData
    },

    isCrossOrigin: function (url) {
      return !isNodeJS && /(\w+:)\/{2}((.*?)\/|(.*)$)/.test(url) && (RegExp.$1 !== location.protocol || RegExp.$2.split('/')[0] !== location.host)
    },

    isString: function (val) {
      return typeof val === 'string'
    },

    isObject: function (obj) {
      return obj && typeof obj === 'object'
    },

    isPlainObject: function (val) {
      return val ? val.constructor === Object : false
    },

    isFunction: function (obj) {
      return typeof obj === 'function'
    },

    getLocatOrigin: function () {
      return isNodeJS ? '' : (location.origin || (location.protocol + '//' + location.host))
    },

    getBaseURL: function () {
      if (isNodeJS) {
        return ''
      }
      var pathname = location.pathname
      var lastIndex = lastIndexOf(pathname, '/') + 1
      return utils.getLocatOrigin() + (lastIndex === pathname.length ? pathname : pathname.substring(0, lastIndex))
    },

    objectEach: function (obj, iteratee, context) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          iteratee.call(context, obj[key], key, obj)
        }
      }
    },

    // Serialize Body
    serialize: function (body) {
      var params = []
      utils.objectEach(body, function (item, key) {
        if (item !== undefined) {
          if (utils.isPlainObject(item) || isArray(item)) {
            params = params.concat(parseParam(item, key, isArray(item)))
          } else {
            params.push(encode(key) + '=' + encode(item))
          }
        }
      })
      return params.join('&').replace(/%20/g, '+')
    },

    objectAssign: Object.assign || function (target) {
      for (var source, index = 1, len = arguments.length; index < len; index++) {
        source = arguments[index]
        for (var key in source) {
          if (source.hasOwnProperty(key)) {
            target[key] = source[key]
          }
        }
      }
      return target
    },

    arrayIndexOf: function (array, val) {
      if (array.indexOf) {
        return array.indexOf(val)
      } else {
        for (var index = 0, len = array.length; index < len; index++) {
          if (val === array[index]) {
            return index
          }
        }
      }
      return -1
    },

    arrayEach: function (array, callback, context) {
      if (array.forEach) {
        array.forEach(callback, context)
      } else {
        for (var index = 0, len = array.length; index < len; index++) {
          callback.call(context, array[index], index, array)
        }
      }
    },

    clearContext: function (XEAjax) {
      XEAjax.$context = XEAjax.$Promise = null
    }
  }

  function isArray (obj) {
    return obj ? obj.constructor === Array : false
  }

  function lastIndexOf (str, val) {
    for (var len = str.length - 1; len >= 0; len--) {
      if (val === str[len]) {
        return len
      };
    }
    return -1
  }

  function parseParam (resultVal, resultKey, isArr) {
    var result = []
    utils.objectEach(resultVal, function (item, key) {
      if (utils.isPlainObject(item) || isArray(item)) {
        result = result.concat(parseParam(item, resultKey + '[' + key + ']', isArray(item)))
      } else {
        result.push(encode(resultKey + '[' + (isArr ? '' : key) + ']') + '=' + encode(item))
      }
    })
    return result
  }

  var setupDefaults = {
    method: 'GET',
    baseURL: utils.getBaseURL(),
    mode: 'cors',
    cache: 'default',
    credentials: 'same-origin',
    redirect: 'follow',
    bodyType: 'json-data',
    headers: {
      'Accept': 'application/json, text/plain, */*'
    },
    validateStatus: function (response) {
      return response.status >= 200 && response.status < 300
    }
  }

  function toHeaderKey (name) {
    return ('' + name).toLowerCase()
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

  function XEHeadersPolyfill (headers) {
    this._d = {}
    if (headers instanceof XEHeaders) {
      headers.forEach(function (value, name) {
        this.set(name, value)
      }, this)
    } else {
      utils.objectEach(headers, function (value, name) {
        this.set(name, value)
      }, this)
    }
  }

  var headersPro = XEHeadersPolyfill.prototype

  headersPro.set = function (name, value) {
    this._d[toHeaderKey(name)] = value
  }
  headersPro.get = function (name) {
    var _key = toHeaderKey(name)
    return this.has(_key) ? this._d[_key] : null
  }
  headersPro.append = function (name, value) {
    var _key = toHeaderKey(name)
    if (this.has(_key)) {
      this._d[_key] = this._d[_key] + ', ' + value
    } else {
      this._d[_key] = '' + value
    }
  }
  headersPro.has = function (name) {
    return this._d.hasOwnProperty(toHeaderKey(name))
  }
  headersPro.keys = function () {
    return new XEIterator(this._d, 0)
  }
  headersPro.values = function () {
    return new XEIterator(this._d, 1)
  }
  headersPro.entries = function () {
    return new XEIterator(this._d, 2)
  }
  headersPro['delete'] = function (name) {
    delete this._d[toHeaderKey(name)]
  }
  headersPro.forEach = function (callback, context) {
    utils.objectEach(this._d, callback, context)
  }

  var XEHeaders = typeof Headers === 'undefined' ? XEHeadersPolyfill : Headers

  function XEReadableStream (body, request, response) {
    this.locked = false
    this._getBody = function () {
      var that = this
      var XEPromise = request.$Promise || Promise
      response._response.bodyUsed = true
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

  function XEAbortSignalPolyfill () {
    this.onaborted = null
    this._abortSignal = { aborted: false }
  }

  Object.defineProperty(XEAbortSignalPolyfill.prototype, 'aborted', {
    get: function () {
      return this._abortSignal.aborted
    }
  })

  var requestList = []

  function getSignalIndex (item) {
    for (var index = 0, len = requestList.length; index < len; index++) {
      if (item === requestList[index][0]) {
        return index
      }
    }
  }

  XEAbortSignalPolyfill.prototype.install = function (request) {
    if (request.signal) {
      var index = getSignalIndex(request.signal)
      if (index === undefined) {
        requestList.push([request.signal, [request]])
      } else {
        requestList[index][1].push(request)
      }
    }
  }

  function XEAbortControllerPolyfill () {
    this.signal = new XEAbortSignalPolyfill()
  }

  // Abort Request
  XEAbortControllerPolyfill.prototype.abort = function () {
    var index = getSignalIndex(this.signal)
    if (index !== undefined) {
      utils.arrayEach(requestList[index][1], function (request) {
        request.abort()
        requestList[index][0]._abortSignal.aborted = true
      })
      requestList.splice(index, 1)
    }
  }

  /* eslint-disable no-undef */
  var XEAbortController = typeof AbortController === 'undefined' ? XEAbortControllerPolyfill : AbortController

  /**
   * interceptor queue
   */
  var reqQueue = { resolves: [], rejects: [] }
  var respQueue = { resolves: [], rejects: [] }

  function addCheckQueue (calls, callback) {
    if (utils.arrayIndexOf(calls, callback) === -1) {
      calls.push(callback)
    }
  }

  function useInterceptors (queue) {
    return function (finish, failed) {
      addCheckQueue(queue.resolves, finish)
      addCheckQueue(queue.rejects, failed)
    }
  }

  /**
   * request interceptor
   */
  function requests (request) {
    var XEPromise = request.$Promise || Promise
    var thenInterceptor = XEPromise.resolve(request, request.$context)
    utils.arrayEach(reqQueue.resolves, function (callback) {
      thenInterceptor = thenInterceptor.then(function (req) {
        return new XEPromise(function (resolve) {
          callback(req, function () {
            resolve(req)
          })
        }, request.$context)
      }).catch(function (e) {
        console.error(e)
      })
    })
    return thenInterceptor
  }

  /**
   * response interceptor
   */
  function responseInterceptor (calls, request, response) {
    var XEPromise = request.$Promise || Promise
    var thenInterceptor = XEPromise.resolve(response, request.$context)
    utils.arrayEach(calls, function (callback) {
      thenInterceptor = thenInterceptor.then(function (response) {
        return new XEPromise(function (resolve) {
          callback(response, function (resp) {
            resolve(resp && resp.body && resp.status ? handleExports.toResponse(resp, request) : response)
          }, request)
        }, request.$context)
      }).catch(function (e) {
        console.error(e)
      })
    })
    return thenInterceptor
  }

  var interceptors = {
    request: {
      use: useInterceptors(reqQueue)
    },
    response: {
      use: useInterceptors(respQueue)
    }
  }

  // default interceptor
  interceptors.request.use(function (request, next) {
    if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
      if (!utils.isFormData(request.body)) {
        request.headers.set('Content-Type', request.bodyType === 'json-data' ? 'application/json; charset=utf-8' : 'application/x-www-form-urlencoded')
      }
    }
    if (utils.isCrossOrigin(request.getUrl())) {
      request.headers.set('X-Requested-With', 'XMLHttpRequest')
    }
    next()
  })

  var interceptorExports = {
    interceptors: interceptors,
    requests: requests,
    responseResolves: function (request, response, resolve, reject) {
      responseInterceptor(respQueue.resolves, request, response).then(resolve)
    },
    responseRejects: function (request, response, resolve, reject) {
      responseInterceptor(respQueue.rejects, request, response).then(function (e) {
        (handleExports.isResponse(e) ? resolve : reject)(e)
      })
    }
  }

  function XERequest (options) {
    utils.objectAssign(this, { url: '', body: '', params: '', signal: '' }, options)
    this.headers = new XEHeaders(options.headers)
    this.method = this.method.toLocaleUpperCase()
    this.bodyType = this.bodyType.toLowerCase()
    if (this.signal && utils.isFunction(this.signal.install)) {
      this.signal.install(this)
    }
  }

  var requestPro = XERequest.prototype

  requestPro.abort = function () {
    if (this.xhr) {
      this.xhr.abort()
    }
    this.$abort = true
  }
  requestPro.getUrl = function () {
    var url = this.url
    var params = ''
    if (url) {
      var _param = utils.arrayIndexOf(['no-store', 'no-cache', 'reload'], this.cache) === -1 ? {} : { _t: Date.now() }
      if (utils.isFunction(this.transformParams)) {
        this.params = this.transformParams(this.params || {}, this)
      }
      if (this.params && !utils.isFormData(this.params)) {
        params = utils.isString(this.params) ? this.params : (this.paramsSerializer || utils.serialize)(utils.objectAssign(_param, this.params), this)
      } else {
        params = utils.serialize(_param)
      }
      if (params) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + params
      }
      if (/\w+:\/{2}.*/.test(url)) {
        return url
      }
      if (url.indexOf('//') === 0) {
        return (utils._N ? '' : location.protocol) + url
      }
      if (url.indexOf('/') === 0) {
        return utils.getLocatOrigin() + url
      }
      return this.baseURL.replace(/\/$/, '') + '/' + url
    }
    return url
  }
  requestPro.getBody = function () {
    var result = null
    var body = this.body
    if (body && this.method !== 'GET' && this.method !== 'HEAD') {
      if (this.transformBody) {
        body = this.body = this.transformBody(body, this) || body
      }
      if (this.stringifyBody) {
        result = this.stringifyBody(body, this)
      } else {
        if (utils.isFormData(body) || utils.isString(body)) {
          result = body
        } else {
          result = this.bodyType === 'form-data' ? utils.serialize(body) : JSON.stringify(body)
        }
      }
    }
    return result
  }

  function XEResponse (body, options, request) {
    this._body = body
    this._request = request
    this._response = {
      body: new XEReadableStream(body, request, this),
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

  utils.arrayEach(['body', 'bodyUsed', 'url', 'headers', 'status', 'statusText', 'ok', 'redirected', 'type'], function (name) {
    Object.defineProperty(XEResponse.prototype, name, {
      get: function () {
        return this._response[name]
      }
    })
  })

  var decode = decodeURIComponent
  var responsePro = XEResponse.prototype

  responsePro.clone = function () {
    if (this.bodyUsed) {
      throw new TypeError("Failed to execute 'clone' on 'Response': Response body is already used")
    }
    return new XEResponse(this._body, this, this._request)
  }
  responsePro.json = function () {
    return this.text().then(function (text) {
      return JSON.parse(text)
    })
  }
  responsePro.text = function () {
    return this.body._getBody(this)
  }

  if (utils._A) {
    responsePro.text = function () {
      var request = this._request
      return this.blob().then(function (blob) {
        var fileReader = new FileReader()
        var result = fileReaderReady(request, fileReader)
        fileReader.readAsText(blob)
        return result
      })
    }
    responsePro.blob = function () {
      return this.body._getBody(this)
    }
    responsePro.arrayBuffer = function () {
      var request = this._request
      return this.blob().then(function (blob) {
        var fileReader = new FileReader()
        var result = fileReaderReady(request, fileReader)
        fileReader.readAsArrayBuffer(blob)
        return result
      })
    }
    responsePro.formData = function () {
      return this.text().then(function (text) {
        var formData = new FormData()
        utils.arrayEach(text.trim().split('&'), function (bytes) {
          if (bytes) {
            var split = bytes.split('=')
            var name = split.shift().replace(/\+/g, ' ')
            var value = split.join('=').replace(/\+/g, ' ')
            formData.append(decode(name), decode(value))
          }
        })
        return formData
      })
    }
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

  function isResponse (obj) {
    if (obj) {
      return (typeof Response !== 'undefined' && obj.constructor === Response) || obj.constructor === XEResponse
    }
    return false
  }

  var handleExports = {
    isResponse: isResponse,
    // result to Response
    toResponse: function (resp, request) {
      if (isResponse(resp)) {
        return resp
      }
      var options = { status: resp.status, statusText: resp.statusText, headers: resp.headers }
      if (utils._A) {
        return new XEResponse(resp.body instanceof Blob ? resp.body : new Blob([utils.isString(resp.body) ? resp.body : JSON.stringify(resp.body)]), options, request)
      }
      return new XEResponse(utils.isString(resp.body) ? resp.body : JSON.stringify(resp.body), options, request)
    }
  }

  /**
   * xhr
   * @param { XERequest } request
   * @param { Function } finish
   * @param { Function } failed
   */
  function sendXHR (request, finish, failed) {
    var url = request.getUrl()
    if (request.mode === 'same-origin') {
      if (utils.isCrossOrigin(url)) {
        failed()
        throw new TypeError('Fetch API cannot load ' + url + '. Request mode is "same-origin" but the URL\'s origin is not same as the request origin ' + utils.getLocatOrigin() + '.')
      }
    }
    var $XMLHttpRequest = request.$XMLHttpRequest || XMLHttpRequest
    var xhr = request.xhr = new $XMLHttpRequest()
    xhr._request = request
    xhr.open(request.method, url, true)
    if (request.timeout) {
      setTimeout(function () {
        xhr.abort()
      }, request.timeout)
    }
    request.headers.forEach(function (value, name) {
      xhr.setRequestHeader(name, value)
    })
    xhr.onload = function () {
      finish(new XEResponse(xhr.response, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: parseXHRHeaders(xhr)
      }, request))
    }
    xhr.onerror = function () {
      failed()
    }
    xhr.ontimeout = function () {
      failed('timeout')
    }
    xhr.onabort = function () {
      failed('aborted')
    }
    if (utils._A) {
      xhr.responseType = 'blob'
    }
    if (request.credentials === 'include') {
      xhr.withCredentials = true
    } else if (request.credentials === 'omit') {
      xhr.withCredentials = false
    }
    xhr.send(request.getBody())
    if (request.$abort) {
      xhr.abort()
    }
  }

  function parseXHRHeaders (xhr) {
    var headers = {}
    var allResponseHeaders = xhr.getAllResponseHeaders().trim()
    utils.arrayEach(allResponseHeaders.split('\n'), function (row) {
      var index = row.indexOf(':')
      headers[row.slice(0, index).trim()] = row.slice(index + 1).trim()
    })
    return headers
  }

  /**
   * fetch
   * @param { XERequest } request
   * @param { Function } finish
   * @param { Function } failed
   */
  function sendFetch (request, finish, failed) {
    var timer = ''
    var $fetch = request.$fetch || self.fetch
    var options = {
      _request: request,
      method: request.method,
      mode: request.mode,
      cache: request.cache,
      credentials: request.credentials,
      redirect: request.redirect,
      body: request.getBody(),
      headers: request.headers
    }
    if (request.timeout) {
      timer = setTimeout(function () {
        failed('timeout')
      }, request.timeout)
    }
    if (request.signal && request.signal.aborted) {
      failed('aborted')
    } else {
      $fetch(request.getUrl(), options).then(function (resp) {
        clearTimeout(timer)
        finish(handleExports.toResponse(resp, request))
      }).catch(function (e) {
        clearTimeout(timer)
        failed()
      })
    }
  }

  function getRequest (request) {
    if (request.$fetch) {
      return request.signal ? sendXHR : sendFetch
    } else if (utils._F) {
      if (typeof AbortController !== 'undefined' && typeof AbortSignal !== 'undefined') {
        return sendFetch
      }
      return request.signal ? sendXHR : sendFetch
    }
    return sendXHR
  }

  function createRequestFactory () {
    if (utils._N) {
      return sendHttp
    } else if (utils._F) {
      return function (request) {
        return getRequest(request).apply(this, arguments)
      }
    }
    return sendXHR
  }

  var fetchRequest = createRequestFactory()

  var jsonpIndex = 0
  var $global = typeof window === 'undefined' ? '' : window
  var $dom = $global ? $global.document : ''

  /**
   * jsonp
   * @param { XERequest } request
   * @param { Function } finish
   * @param { Function } failed
   */
  function sendJSONP (request, finish, failed) {
    request.script = $dom.createElement('script')
    var jsonpCallback = request.jsonpCallback
    var script = request.script
    if (!jsonpCallback) {
      jsonpCallback = request.jsonpCallback = 'jsonp_xe_' + Date.now() + '_' + (++jsonpIndex)
    }
    if (utils.isFunction(request.$jsonp)) {
      return request.$jsonp(script, request).then(function (resp) {
        finish(handleExports.toResponse({ status: 200, body: resp }, request))
      }).catch(function () {
        failed()
      })
    } else {
      var url = request.getUrl()
      $global[jsonpCallback] = function (body) {
        jsonpClear(request, jsonpCallback)
        finish({ status: 200, body: body })
      }
      script.type = 'text/javascript'
      script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + request.jsonp + '=' + jsonpCallback
      script.onerror = function () {
        jsonpClear(request, jsonpCallback)
        finish()
      }
      if (request.timeout) {
        setTimeout(function () {
          jsonpClear(request, jsonpCallback)
          finish('timeout')
        }, request.timeout)
      }
      $dom.body.appendChild(script)
    }
  }

  function jsonpClear (request, jsonpCallback) {
    if (request.script.parentNode === $dom.body) {
      $dom.body.removeChild(request.script)
    }
    try {
      delete $global[jsonpCallback]
    } catch (e) {
      // IE8
      $global[jsonpCallback] = undefined
    }
  }

  var errorType = {
    aborted: 'The user aborted a request.',
    timeout: 'Request timeout.',
    failed: 'Network request failed.'
  }

  /**
    * 支持: nodejs和浏览器 fetch
    *
    * @param { Object} options
    * @return { Promise }
    */
  function XEAjax (options) {
    var opts = utils.objectAssign({}, setupDefaults, { headers: utils.objectAssign({}, setupDefaults.headers) }, options)
    var request = new XERequest(opts)
    var XEPromise = request.$Promise || Promise
    return new XEPromise(function (resolve, reject) {
      return interceptorExports.requests(request).then(function () {
        (request.jsonp ? sendJSONP : fetchRequest)(request, function (response) {
          interceptorExports.responseResolves(request, handleExports.toResponse(response, request), resolve, reject)
        }, function (type) {
          interceptorExports.responseRejects(request, new TypeError(errorType[type || 'failed']), resolve, reject)
        })
      })
    }, request.$context)
  }

  XEAjax.version = '3.4.3'
  XEAjax.interceptors = interceptorExports.interceptors
  XEAjax.serialize = utils.serialize
  XEAjax.AbortController = XEAbortController

  /**
   * installation
   */
  XEAjax.use = function (plugin) {
    plugin.install(XEAjax)
  }

  /**
   * options
   *
   * 基础参数
   * @param { String } url 请求地址
   * @param { String } baseURL 基础路径，默认上下文路径
   * @param { String } method 请求方法(默认GET)
   * @param { Object } params 请求参数，序列化后会拼接在url
   * @param { Object } body 提交参数
   * @param { String } bodyType 提交参数方式可以设置json-data,form-data(json-data)
   * @param { String } jsonp 调用jsonp服务,回调属性默认callback
   * @param { String } cache 处理缓存方式,可以设置default,no-store,no-cache,reload,force-cache,only-if-cached(默认default)
   * @param { String } credentials 设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include(默认same-origin)
   * @param { Number } timeout 设置超时
   * @param { Object } headers 请求头
   * @param { Function } transformParams(params, request) 用于改变URL参数
   * @param { Function } paramsSerializer(params, request) 自定义URL序列化函数
   * @param { Function } transformBody(body, request) 用于改变提交数据
   * @param { Function } stringifyBody(body, request) 自定义转换提交数据的函数
   * @param { Function } validateStatus(response) 自定义校验请求是否成功
   * 高级参数
   * @param { Function } $XMLHttpRequest 自定义 XMLHttpRequest 请求函数
   * @param { Function } $http 自定义 http 请求函数
   * @param { Function } $fetch 自定义 fetch 请求函数
   * @param { Function } $jsonp 自定义 jsonp 处理函数
   * @param { Function } $Promise 自定义 Promise 函数
   * @param { Function } $context 自定义上下文
   * @param { Function } $options 自定义参数
   */
  XEAjax.setup = function (options) {
    utils.objectAssign(setupDefaults, options)
  }

  function getOptions (method, def, options) {
    var opts = utils.objectAssign({ method: method, $context: XEAjax.$context, $Promise: XEAjax.$Promise }, def, options)
    utils.clearContext(XEAjax)
    return opts
  }

  function responseHeaders (response) {
    var result = {}
    response.headers.forEach(function (value, key) {
      result[key] = value
    })
    return result
  }

  // to fetch response
  function requestToFetchResponse (method) {
    return function () {
      return XEAjax(method.apply(this, arguments))
    }
  }

  function getResponseSchema (isRespSchema, data, status, statusText, headers) {
    return isRespSchema ? {
      data: data,
      status: status,
      statusText: statusText,
      headers: headers
    } : data
  }

  function createResponseSchema (method, isRespSchema) {
    return function () {
      var opts = method.apply(this, arguments)
      var XEPromise = opts.$Promise || Promise
      return XEAjax(opts).catch(function (e) {
        return XEPromise.reject(getResponseSchema(isRespSchema, '', 'failed', e.message || e, {}), this)
      }).then(function (response) {
        return new XEPromise(function (resolve, reject) {
          var finish = response.ok ? resolve : reject
          response.clone().json().catch(function (e) {
            return response.clone().text()
          }).then(function (data) {
            finish(getResponseSchema(isRespSchema, data, response.status, response.statusText, responseHeaders(response)))
          })
        }, this)
      })
    }
  }

  // to response
  function requestToResponse (method) {
    return createResponseSchema(method, true)
  }

  // to json
  function requestToJSON (method) {
    return createResponseSchema(method)
  }

  // Promise.all
  function doAll (iterable) {
    var XEPromise = XEAjax.$Promise || Promise
    var context = XEAjax.$context
    utils.clearContext(XEAjax)
    return XEPromise.all(iterable.map(function (item) {
      if (item instanceof XEPromise || item instanceof Promise) {
        return item
      }
      return utils.isObject(item) ? XEAjax(utils.objectAssign({ $context: context, $Promise: XEPromise }, item)) : item
    }), context)
  }

  function createFetch (method) {
    return function (url, opts) {
      return getOptions(method, { url: url }, opts)
    }
  }

  function createParamsFetch (method, defs) {
    return function (url, params, opts) {
      return getOptions(method, utils.objectAssign({ url: url, params: params }, defs), opts)
    }
  }

  function createBodyFetch (method) {
    return function (url, body, opts) {
      return getOptions(method, { url: url, body: body }, opts)
    }
  }

  var requestHead = createFetch('HEAD')
  var requestDelete = createFetch('DELETE')
  var requestJsonp = createParamsFetch('GET', { jsonp: 'callback' })
  var requestGet = createParamsFetch('GET')
  var requestPost = createBodyFetch('POST')
  var requestPut = createBodyFetch('PUT')
  var requestPatch = createBodyFetch('PATCH')

  var ajaxExports = {
    doAll: doAll,
    ajax: XEAjax,

    fetch: requestToFetchResponse(createFetch('GET')),
    fetchGet: requestToFetchResponse(requestGet),
    fetchPost: requestToFetchResponse(requestPost),
    fetchPut: requestToFetchResponse(requestPut),
    fetchDelete: requestToFetchResponse(requestDelete),
    fetchPatch: requestToFetchResponse(requestPatch),
    fetchHead: requestToFetchResponse(requestHead),
    fetchJsonp: requestToFetchResponse(requestJsonp),

    doGet: requestToResponse(requestGet),
    doPost: requestToResponse(requestPost),
    doPut: requestToResponse(requestPut),
    doDelete: requestToResponse(requestDelete),
    doPatch: requestToResponse(requestPatch),
    doHead: requestToResponse(requestHead),
    doJsonp: requestToResponse(requestJsonp),

    getJSON: requestToJSON(requestGet),
    postJSON: requestToJSON(requestPost),
    putJSON: requestToJSON(requestPut),
    deleteJSON: requestToJSON(requestDelete),
    patchJSON: requestToJSON(requestPatch),
    headJSON: requestToJSON(requestHead),
    jsonp: requestToJSON(requestJsonp)
  }

  /**
   * functions of mixing
   *
   * @param {Object} methods
   */
  XEAjax.mixin = function (methods) {
    utils.objectEach(methods, function (fn, name) {
      XEAjax[name] = utils.isFunction(fn) ? function () {
        var result = fn.apply(XEAjax.$context, arguments)
        utils.clearContext(XEAjax)
        return result
      } : fn
    })
  }

  XEAjax.mixin(ajaxExports)

  return XEAjax
}))
