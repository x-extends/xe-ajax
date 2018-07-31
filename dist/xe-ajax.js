/**
 * xe-ajax.js v3.4.6
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

  /* eslint-disable valid-typeof */
  var STRING_UNDEFINED = 'undefined'
  var encode = encodeURIComponent
  var isNodeJS = typeof window === STRING_UNDEFINED && typeof process !== STRING_UNDEFINED
  var isFetchAbortController = typeof AbortController !== STRING_UNDEFINED && typeof AbortSignal !== STRING_UNDEFINED
  var $console = typeof console === STRING_UNDEFINED ? '' : console
  var $locat = ''

  if (!isNodeJS) {
    $locat = location
  }

  function isPlainObject (val) {
    return val ? val.constructor === Object : false
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
      if (isPlainObject(item) || isArray(item)) {
        result = result.concat(parseParam(item, resultKey + '[' + key + ']', isArray(item)))
      } else {
        result.push(encode(resultKey + '[' + (isArr ? '' : key) + ']') + '=' + encode(item === null ? '' : item))
      }
    })
    return result
  }

  function getLocatOrigin () {
    return isNodeJS ? '' : ($locat.origin || ($locat.protocol + '//' + $locat.host))
  }

  var utils = {

    _N: isNodeJS, // nodejs 环境
    _F: isNodeJS ? false : !!self.fetch, // 支持 fetch
    _A: !(typeof Blob === STRING_UNDEFINED || typeof FormData === STRING_UNDEFINED || typeof FileReader === STRING_UNDEFINED), // IE10+ 支持Blob
    _FAC: isFetchAbortController, // fetch 是否支持 AbortController AbortSignal

    isFData: function (obj) {
      return typeof FormData !== STRING_UNDEFINED && obj instanceof FormData
    },

    isCrossOrigin: function (url) {
      return !isNodeJS && /(\w+:)\/{2}((.*?)\/|(.*)$)/.test(url) && (RegExp.$1 !== $locat.protocol || RegExp.$2.split('/')[0] !== $locat.host)
    },

    isStr: function (val) {
      return typeof val === 'string'
    },

    isObj: function (obj) {
      return obj && typeof obj === 'object'
    },

    isPlainObject: isPlainObject,

    isFn: function (obj) {
      return typeof obj === 'function'
    },

    err: function (e) {
      var outError = $console.error ? $console.error : ''
      if (outError) {
        outError(e)
      }
    },

    getOrigin: getLocatOrigin,

    getBaseURL: function () {
      if (isNodeJS) {
        return ''
      }
      var pathname = $locat.pathname
      var lastIndex = lastIndexOf(pathname, '/') + 1
      return getLocatOrigin() + (lastIndex === pathname.length ? pathname : pathname.substring(0, lastIndex))
    },

    objectEach: objectEach,

    // Serialize Body
    serialize: function (body) {
      var params = []
      objectEach(body, function (item, key) {
        if (item !== undefined) {
          if (isPlainObject(item) || isArray(item)) {
            params = params.concat(parseParam(item, key, isArray(item)))
          } else {
            params.push(encode(key) + '=' + encode(item === null ? '' : item))
          }
        }
      })
      return params.join('&').replace(/%20/g, '+')
    },

    assign: Object.assign || function (target) {
      var args = arguments
      for (var source, index = 1, len = args.length; index < len; index++) {
        source = args[index]
        for (var key in source) {
          if (source.hasOwnProperty(key)) {
            target[key] = source[key]
          }
        }
      }
      return target
    },

    includes: function (array, val) {
      return lastIndexOf(array, val) > -1
    },

    arrayEach: function (array, callback, context) {
      for (var index = 0, len = array.length; index < len; index++) {
        callback.call(context, array[index], index, array)
      }
    },

    clearContext: function (XEAjax) {
      XEAjax.$context = XEAjax.$Promise = null
    }
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
    utils.objectEach(obj, function (value, name) {
      result.push([name, value, [name, value]][getIndex])
    })
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
    var that = this
    var defset = function (value, name) {
      that.set(name, value)
    }
    that._d = {}
    if (headers instanceof XEHeaders) {
      headers.forEach(defset)
    } else {
      utils.objectEach(headers, defset)
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
    var store = this._d
    if (this.has(_key)) {
      store[_key] = store[_key] + ', ' + value
    } else {
      store[_key] = '' + value
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
      var stream = this
      var XEPromise = request.$Promise || Promise
      response._response.bodyUsed = true
      return new XEPromise(function (resolve, reject) {
        if (stream.locked) {
          reject(new TypeError('body stream already read'))
        } else {
          stream.locked = true
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
    return -1
  }

  XEAbortSignalPolyfill.prototype.install = function (request) {
    var reqSignal = request.signal
    if (reqSignal) {
      var index = getSignalIndex(reqSignal)
      if (index > -1) {
        requestList[index][1].push(request)
      } else {
        requestList.push([reqSignal, [request]])
      }
    }
  }

  function XEAbortControllerPolyfill () {
    this.signal = new XEAbortSignalPolyfill()
  }

  // Abort Request
  XEAbortControllerPolyfill.prototype.abort = function () {
    var index = getSignalIndex(this.signal)
    if (index > -1) {
      var requestItem = requestList[index]
      utils.arrayEach(requestItem[1], function (request) {
        request.abort()
        requestItem[0]._abortSignal.aborted = true
      })
      requestList.splice(index, 1)
    }
  }

  /* eslint-disable no-undef */
  var XEAbortController = utils._FAC ? AbortController : XEAbortControllerPolyfill

  /**
   * interceptor queue
   */
  var reqQueue = { resolves: [], rejects: [] }
  var respQueue = { resolves: [], rejects: [] }

  function addCheckQueue (calls, callback) {
    if (!utils.includes(calls, callback)) {
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
      }).catch(utils.err)
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
      }).catch(utils.err)
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
    var reqHeaders = request.headers
    var reqBody = request.body
    var reqMethod = request.method
    if (reqBody && reqMethod !== 'GET' && reqMethod !== 'HEAD') {
      if (!utils.isFData(reqBody)) {
        reqHeaders.set('Content-Type', request.bodyType === 'json-data' ? 'application/json; charset=utf-8' : 'application/x-www-form-urlencoded')
      }
    }
    if (utils.isCrossOrigin(request.getUrl())) {
      reqHeaders.set('X-Requested-With', 'XMLHttpRequest')
    }
    next()
  })

  function responseToResolves (request, response, resolve, reject) {
    responseInterceptor(respQueue.resolves, request, response).then(resolve)
  }

  function responseToRejects (request, response, resolve, reject) {
    responseInterceptor(respQueue.rejects, request, response).then(function (e) {
      (handleExports.isResponse(e) ? resolve : reject)(e)
    })
  }

  var interceptorExports = {
    interceptors: interceptors,
    requests: requests,
    toResolves: responseToResolves,
    toRejects: responseToRejects
  }

  function XERequest (options) {
    utils.assign(this, { url: '', body: '', params: '', signal: '' }, options)
    this.headers = new XEHeaders(options.headers)
    this.method = this.method.toLocaleUpperCase()
    this.bodyType = this.bodyType.toLowerCase()
    var reqSignal = this.signal
    if (reqSignal && reqSignal.install) {
      reqSignal.install(this)
    }
  }

  var requestPro = XERequest.prototype

  requestPro.abort = function () {
    var xhr = this.xhr
    if (xhr) {
      xhr.abort()
    }
    this.$abort = true
  }
  requestPro.getUrl = function () {
    var url = this.url
    var params = this.params
    if (url) {
      var _param = utils.includes(['no-store', 'no-cache', 'reload'], this.cache) ? { _t: Date.now() } : {}
      var transformParams = this.transformParams
      if (transformParams) {
        params = this.params = transformParams(params || {}, this)
      }
      if (params && !utils.isFData(params)) {
        params = utils.isStr(params) ? params : (this.paramsSerializer || utils.serialize)(utils.assign(_param, params), this)
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
        return utils.getOrigin() + url
      }
      return this.baseURL.replace(/\/$/, '') + '/' + url
    }
    return url
  }
  requestPro.getBody = function () {
    var result = null
    var body = this.body
    var reqMethod = this.method
    if (body && reqMethod !== 'GET' && reqMethod !== 'HEAD') {
      var transformBody = this.transformBody
      var stringifyBody = this.stringifyBody
      if (transformBody) {
        body = this.body = transformBody(body, this) || body
      }
      if (stringifyBody) {
        result = stringifyBody(body, this)
      } else {
        if (utils.isFData(body) || utils.isStr(body)) {
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
    var status = options.status
    var _response = this._response = {
      body: new XEReadableStream(body, request, this),
      bodyUsed: false,
      url: request.url,
      status: status,
      statusText: options.statusText,
      redirected: status === 302,
      headers: new XEHeaders(options.headers || {}),
      type: 'basic'
    }
    _response.ok = request.validateStatus(this)
  }

  var decode = decodeURIComponent
  var responsePro = XEResponse.prototype

  utils.arrayEach('body,bodyUsed,url,headers,status,statusText,ok,redirected,type'.split(','), function (name) {
    Object.defineProperty(responsePro, name, {
      get: function () {
        return this._response[name]
      }
    })
  })

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
      var objConstructor = obj.constructor
      return (typeof Response !== 'undefined' && objConstructor === Response) || objConstructor === XEResponse
    }
    return false
  }

  function getStringifyBody (reqBody) {
    return utils.isStr(reqBody) ? reqBody : JSON.stringify(reqBody)
  }

  var handleExports = {
    isResponse: isResponse,
    // result to Response
    toResponse: function (resp, request) {
      if (isResponse(resp)) {
        return resp
      }
      var reqBody = resp.body
      var options = { status: resp.status, statusText: resp.statusText, headers: resp.headers }
      if (utils._A) {
        reqBody = reqBody instanceof Blob ? reqBody : new Blob([getStringifyBody(reqBody)])
      } else {
        reqBody = getStringifyBody(reqBody)
      }
      return new XEResponse(reqBody, options, request)
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
    var reqTimeout = request.timeout
    var reqCredentials = request.credentials
    if (request.mode === 'same-origin') {
      if (utils.isCrossOrigin(url)) {
        failed()
        throw new TypeError('Fetch API cannot load ' + url + '. Request mode is "same-origin" but the URL\'s origin is not same as the request origin ' + utils.getOrigin() + '.')
      }
    }
    var $XMLHttpRequest = request.$XMLHttpRequest || XMLHttpRequest
    var xhr = request.xhr = new $XMLHttpRequest()
    xhr._request = request
    xhr.open(request.method, url, true)
    if (reqTimeout) {
      setTimeout(function () {
        xhr.abort()
      }, reqTimeout)
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
      failed('E_T')
    }
    xhr.onabort = function () {
      failed('E_A')
    }
    if (utils._A) {
      xhr.responseType = 'blob'
    }
    if (reqCredentials === 'include') {
      xhr.withCredentials = true
    } else if (reqCredentials === 'omit') {
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
    var reqTimeout = request.timeout
    var options = {
      _request: request,
      body: request.getBody()
    }
    var reqSignal = request.signal
    var clearTimeoutFn = clearTimeout
    utils.arrayEach('method,headers,signal,mode,cache,credentials,redirect,referrer,referrerPolicy,keepalive,integrity'.split(','), function (pro) {
      if (request[pro]) {
        options[pro] = request[pro]
      }
    })
    if (reqTimeout) {
      timer = setTimeout(function () {
        failed('E_T')
      }, reqTimeout)
    }
    if (reqSignal && reqSignal.aborted) {
      failed('E_A')
    } else {
      $fetch(request.getUrl(), options).then(function (resp) {
        clearTimeoutFn(timer)
        finish(handleExports.toResponse(resp, request))
      }).catch(function (e) {
        clearTimeoutFn(timer)
        failed()
      })
    }
  }

  function getRequest (request) {
    var reqSignal = request.signal
    if (request.$fetch) {
      return reqSignal ? sendXHR : sendFetch
    } else if (utils._F) {
      if (utils._FAC) {
        return sendFetch
      }
      return reqSignal ? sendXHR : sendFetch
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
    var reqTimeout = request.timeout
    var jsonpCallback = request.jsonpCallback
    var script = request.script = $dom.createElement('script')
    if (!jsonpCallback) {
      jsonpCallback = request.jsonpCallback = 'jsonp_xe_' + Date.now() + '_' + (++jsonpIndex)
    }
    if (utils.isFn(request.$jsonp)) {
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
      if (reqTimeout) {
        setTimeout(function () {
          jsonpClear(request, jsonpCallback)
          finish('E_T')
        }, reqTimeout)
      }
      $dom.body.appendChild(script)
    }
  }

  function jsonpClear (request, jsonpCallback) {
    var script = request.script
    var $body = $dom.body
    if (script.parentNode === $body) {
      $body.removeChild(script)
    }
    try {
      delete $global[jsonpCallback]
    } catch (e) {
      // IE8
      $global[jsonpCallback] = undefined
    }
  }

  var errorType = {
    E_A: 'The user aborted a request.',
    E_T: 'Request timeout.',
    E_F: 'Network request failed.'
  }

  /**
    * 支持: nodejs和浏览器 fetch
    *
    * @param { Object} options
    * @return { Promise }
    */
  function XEAjax (options) {
    var opts = utils.assign({}, setupDefaults, { headers: utils.assign({}, setupDefaults.headers) }, options)
    var request = new XERequest(opts)
    var XEPromise = request.$Promise || Promise
    return new XEPromise(function (resolve, reject) {
      return interceptorExports.requests(request).then(function () {
        (request.jsonp ? sendJSONP : fetchRequest)(request, function (response) {
          interceptorExports.toResolves(request, handleExports.toResponse(response, request), resolve, reject)
        }, function (type) {
          interceptorExports.toRejects(request, new TypeError(errorType[type || 'E_F']), resolve, reject)
        })
      })
    }, request.$context)
  }

  XEAjax.version = '3.4.6'
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
   * @param { Number } timeout 设置超时
   * @param { Object } headers 请求头
   * @param { Function } transformParams(params, request) 用于改变URL参数
   * @param { Function } paramsSerializer(params, request) 自定义URL序列化函数
   * @param { Function } transformBody(body, request) 用于改变提交数据
   * @param { Function } stringifyBody(body, request) 自定义转换提交数据的函数
   * @param { Function } validateStatus(response) 自定义校验请求是否成功
   * 只有在原生支持 fetch 的环境下才有效
   * @param { String } credentials 设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include(默认same-origin)
   * @param { String } referrer 可以设置: no-referrer,client或URL(默认client)
   * @param { String } referrerPolicy 可以设置: no-referrer,no-referrer-when-downgrade,origin,origin-when-cross-origin,unsafe-url
   * @param { String } integrity 包括请求的subresource integrity值(例如：sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=)
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
    utils.assign(setupDefaults, options)
  }

  var clearContext = utils.clearContext

  function getOptions (method, def, options) {
    var opts = utils.assign({ method: method, $context: XEAjax.$context, $Promise: XEAjax.$Promise }, def, options)
    clearContext(XEAjax)
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
    clearContext(XEAjax)
    return XEPromise.all(iterable.map(function (item) {
      if (item instanceof XEPromise || item instanceof Promise) {
        return item
      }
      return utils.isObj(item) ? XEAjax(utils.assign({ $context: context, $Promise: XEPromise }, item)) : item
    }), context)
  }

  function createFetch (method) {
    return function (url, opts) {
      return getOptions(method, { url: url }, opts)
    }
  }

  function createParamsFetch (method, defs) {
    return function (url, params, opts) {
      return getOptions(method, utils.assign({ url: url, params: params }, defs), opts)
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
      XEAjax[name] = utils.isFn(fn) ? function () {
        var result = fn.apply(XEAjax.$context, arguments)
        clearContext(XEAjax)
        return result
      } : fn
    })
  }

  XEAjax.mixin(ajaxExports)

  return XEAjax
}))
