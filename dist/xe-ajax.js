/**
 * xe-ajax.js v4.0.3
 * MIT License.
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

  function stringifyParams (resultVal, resultKey, isArr) {
    var result = []
    objectEach(resultVal, function (item, key) {
      var _arr = isArray(item)
      if (isPlainObject(item) || _arr) {
        result = result.concat(stringifyParams(item, resultKey + '[' + key + ']', _arr))
      } else {
        result.push(encode(resultKey + '[' + (isArr ? '' : key) + ']') + '=' + encode(item === null ? '' : item))
      }
    })
    return result
  }

  function getLocatOrigin (request) {
    return request.origin || (isNodeJS ? '' : ($locat.origin || ($locat.protocol + '//' + $locat.host)))
  }

  var utils = {

    IS_N: isNodeJS, // nodejs 环境
    IS_F: isNodeJS ? false : !!self.fetch, // 支持 fetch
    IS_A: !(typeof Blob === STRING_UNDEFINED || typeof FormData === STRING_UNDEFINED || typeof FileReader === STRING_UNDEFINED), // IE10+ 支持Blob
    IS_FAC: isFetchAbortController, // fetch 是否支持 AbortController AbortSignal
    IS_DP: Object.defineProperty && ({}).__defineGetter__, // ie7-8 false

    isFData: function (obj) {
      return typeof FormData !== STRING_UNDEFINED && obj instanceof FormData
    },

    isURLSParams: function (obj) {
      return typeof URLSearchParams !== STRING_UNDEFINED && obj instanceof URLSearchParams
    },

    isCrossOrigin: function (url) {
      if (!isNodeJS) {
        var matchs = ('' + url).match(/(\w+:)\/{2}((.*?)\/|(.*)$)/)
        if (matchs && matchs.length > 2) {
          return matchs[1] !== $locat.protocol || matchs[2].split('/')[0] !== $locat.host
        }
      }
      return false
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

    createErr: function (message) {
      return new Error(message)
    },

    err: $console.error ? function (e) {
      $console.error(e)
    } : function () { },

    getOrigin: getLocatOrigin,

    getBaseURL: function (request) {
      if (request.baseURL) {
        return request.baseURL
      }
      if (isNodeJS) {
        return ''
      }
      var pathname = $locat.pathname
      var lastIndex = lastIndexOf(pathname, '/') + 1
      return getLocatOrigin(request) + (lastIndex === pathname.length ? pathname : pathname.substring(0, lastIndex))
    },

    objectEach: objectEach,

    // Serialize body
    serialize: function (body) {
      var _arr
      var params = []
      objectEach(body, function (item, key) {
        if (item !== undefined) {
          _arr = isArray(item)
          if (isPlainObject(item) || _arr) {
            params = params.concat(stringifyParams(item, key, _arr))
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

    trim: function (str) {
      return ('' + str).replace(/(^\s*)|(\s*$)/g, '')
    },

    includes: function (array, val) {
      return lastIndexOf(array, val) > -1
    },

    arrayEach: function (array, callback, context) {
      for (var index = 0, len = array.length; index < len; index++) {
        callback.call(context, array[index], index, array)
      }
    },

    headersEach: function (headers, callabck) {
      if (headers && headers.forEach) {
        headers.forEach(callabck)
      }
    }
  }

  var setupDefaults = {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
    credentials: 'same-origin',
    redirect: 'follow',
    bodyType: 'json-data',
    headers: {
      'Accept': 'application/json, text/plain, */*'
    }
  }

  /**
   * 进度条
   *
   * @param {Object} options 参数
   */
  function XEProgress (options) {
    Object.assign(this, {
      autoCompute: true,
      fixed: 2,
      meanSpeed: 0,
      onDownloadProgress: null,
      onUploadProgress: null
    }, options, { _progress: { value: 0, total: 0, loaded: 0 } })
  }

  if (utils.IS_DP) {
    utils.arrayEach('time,speed,loaded,value,total,remaining'.split(','), function (name) {
      Object.defineProperty(XEProgress.prototype, name, {
        get: function () {
          return this._progress[name]
        }
      })
    })
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

  function getIteratorResult (iterator, value, UNDEFINED) {
    var done = iterator.$index++ >= iterator.$list.length
    return { done: done, value: done ? UNDEFINED : value }
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
    utils[headers instanceof XEHeaders ? 'headersEach' : 'objectEach'](headers, defset)
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
      if (utils.IS_DP) {
        response._response.bodyUsed = true
      } else {
        response.bodyUsed = true
      }
      return new Promise(function (resolve, reject) {
        if (stream.locked) {
          reject(utils.createErr('body stream already read'))
        } else {
          stream.locked = true
          resolve(body)
        }
      })
    }
  }

  function XEAbortSignal () {
    this.onaborted = null
    if (utils.IS_DP) {
      this._store = { aborted: false }
    } else {
      this.aborted = false
    }
  }

  if (utils.IS_DP) {
    Object.defineProperty(XEAbortSignal.prototype, 'aborted', {
      get: function () {
        return this._store.aborted
      }
    })
  }

  var requestList = []

  function getSignalIndex (item) {
    for (var index = 0, len = requestList.length; index < len; index++) {
      if (item === requestList[index][0]) {
        return index
      }
    }
    return -1
  }

  /**
   * 取消控制器
   *
   * @param {XERequest} request XERequest 对象
   */
  XEAbortSignal.prototype.install = function (request) {
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

  function XEAbortController () {
    this.signal = new XEAbortSignal()
  }

  XEAbortController.prototype.abort = function () {
    var index = getSignalIndex(this.signal)
    if (index > -1) {
      var requestItem = requestList[index]
      utils.arrayEach(requestItem[1], function (request) {
        var item = requestItem[0]
        request.abort()
        if (utils.IS_DP) {
          item._store.aborted = true
        } else {
          item.aborted = true
        }
      })
      requestList.splice(index, 1)
    }
  }

  var reqQueue = { resolves: [], rejects: [] }
  var respQueue = { resolves: [], rejects: [] }

  function addCheckQueue (calls, callback) {
    if (!utils.includes(calls, callback)) {
      calls.push(callback)
    }
  }

  function useInterceptors (queue) {
    return function (finish, failed) {
      if (finish) {
        addCheckQueue(queue.resolves, finish)
      }
      if (failed) {
        addCheckQueue(queue.rejects, failed)
      }
    }
  }

  /**
   * Request 拦截器
   */
  function requests (request) {
    var thenInterceptor = Promise.resolve(request)
    utils.arrayEach(reqQueue.resolves, function (callback) {
      thenInterceptor = thenInterceptor.then(function (req) {
        return new Promise(function (resolve) {
          callback(req, function () {
            resolve(req)
          })
        })
      })['catch'](utils.err)
    })
    return thenInterceptor
  }

  /**
   * Response 拦截器
   */
  function responseInterceptor (calls, request, response) {
    var thenInterceptor = Promise.resolve(response)
    utils.arrayEach(calls, function (callback) {
      thenInterceptor = thenInterceptor.then(function (response) {
        return new Promise(function (resolve) {
          callback(response, function (resp) {
            resolve(resp && resp.body && resp.status ? handleExports.toResponse(resp, request) : response)
          }, request)
        })
      })['catch'](utils.err)
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
  var reFullURL = /(\w+:)\/{2}.+/

  requestPro.abort = function () {
    if (this.xhr) {
      this.xhr.abort()
      if (this._noA) {
        this.xhr.onabort()
      }
    }
    this.$abort = true
  }
  requestPro.getUrl = function () {
    var matchs
    var url = this.url
    var params = this.params
    var origin = utils.getOrigin(this)
    var transformParams = this.transformParams
    var _param = utils.includes(['no-store', 'no-cache', 'reload'], this.cache) ? { _t: new Date().getTime() } : {}
    if (url) {
      if (transformParams) {
        params = this.params = transformParams(params || {}, this)
      }
      if (params && !utils.isFData(params) && !utils.isURLSParams(params)) {
        params = utils.isStr(params) ? params : (this.paramsSerializer || utils.serialize)(utils.assign(_param, params), this)
      } else {
        params = utils.serialize(_param)
      }
      if (params) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + params
      }
      if (reFullURL.test(url)) {
        return url
      }
      if (url.indexOf('//') === 0) {
        matchs = origin.match(reFullURL)
        return (matchs ? matchs[1] : (utils.IS_N ? '' : location.protocol)) + url
      }
      if (url.indexOf('/') === 0) {
        return origin + url
      }
      return utils.getBaseURL(this).replace(/\/$/, '') + '/' + url
    }
    return url
  }
  requestPro.getBody = function () {
    var result = null
    var body = this.body
    var reqMethod = this.method
    var transformBody = this.transformBody
    var stringifyBody = this.stringifyBody
    if (body) {
      if (reqMethod === 'GET' || reqMethod === 'HEAD') {
        throw utils.createErr('Request with GET/HEAD method cannot have body')
      } else {
        if (transformBody) {
          body = this.body = transformBody(body, this) || body
        }
        if (stringifyBody) {
          result = stringifyBody(body, this)
        } else {
          if (utils.isURLSParams(body)) {
            result = body.toString()
          } else if (utils.isFData(body) || utils.isStr(body)) {
            result = body
          } else {
            result = this.bodyType === 'form-data' ? utils.serialize(body) : JSON.stringify(body)
          }
        }
      }
    }
    return result
  }

  function validateStatus (response) {
    return response.status >= 200 && response.status < 300
  }

  function XEResponse (body, options, request) {
    this._body = body
    this._request = request
    var status = options.status
    var validStatus = request.validateStatus || validateStatus
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
    if (utils.IS_DP) {
      _response.ok = validStatus(this)
    } else {
      utils.assign(this, _response)
      this.ok = validStatus(this)
    }
  }

  var decode = decodeURIComponent
  var responsePro = XEResponse.prototype

  if (utils.IS_DP) {
    utils.arrayEach('body,bodyUsed,url,headers,status,statusText,ok,redirected,type'.split(','), function (name) {
      Object.defineProperty(responsePro, name, {
        get: function () {
          return this._response[name]
        }
      })
    })
  }

  responsePro.clone = function () {
    if (this.bodyUsed) {
      throw utils.createErr("Failed to execute 'clone' on 'Response': Response body is already used")
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

  if (utils.IS_A) {
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
        utils.arrayEach(utils.trim(text).split('&'), function (bytes) {
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
    return new Promise(function (resolve, reject) {
      reader.onload = function () {
        resolve(reader.result)
      }
      reader.onerror = function () {
        reject(reader.error)
      }
    })
  }

  function isNativeResponse (obj) {
    return obj && typeof Response !== 'undefined' && obj.constructor === Response
  }

  function isResponse (obj) {
    return obj && obj.constructor === XEResponse
  }

  function getStringifyBody (reqBody) {
    return utils.isStr(reqBody) ? reqBody : JSON.stringify(reqBody)
  }

  function getResponse (reqBody, resp, request) {
    var options = { status: resp.status, statusText: resp.statusText, headers: resp.headers }
    if (utils.IS_A) {
      reqBody = reqBody instanceof Blob ? reqBody : new Blob([getStringifyBody(reqBody)])
    } else {
      reqBody = getStringifyBody(reqBody)
    }
    return new XEResponse(reqBody, options, request)
  }

  // 将请求结果转为 Respone 对象
  function toResponse (resp, request) {
    if (isNativeResponse(resp)) {
      return request.validateStatus ? resp.text().then(function (text) {
        return getResponse(text, resp, request)
      }) : Promise.resolve(resp)
    }
    return Promise.resolve(isResponse(resp) ? resp : getResponse(resp.body, resp, request))
  }

  var handleExports = {
    getResponse: getResponse,
    isResponse: isResponse,
    toResponse: toResponse
  }

  /**
   * xhr
   * @param { XERequest } request
   * @param { Function } finish
   * @param { Function } failed
   */
  function sendXHR (request, finish, failed) {
    var uploadProgress
    var downloadProgress
    var autoCompute
    var upload
    var xhrLoadEnd = false
    var url = request.getUrl()
    var reqTimeout = request.timeout
    var reqCredentials = request.credentials
    var $XMLHttpRequest = request.$XMLHttpRequest || XMLHttpRequest
    var xhr = request.xhr = new $XMLHttpRequest()
    var progress = request.progress
    var loadFinish = function () {
      try {
        finish(
          handleExports.getResponse(xhr[utils.IS_A ? 'response' : 'responseText'], {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: parseXHRHeaders(xhr)
          }, request)
        )
      } catch (e) {
        finish({ status: 0, body: null })
      }
      xhrLoadEnd = true
    }
    if (request.mode === 'same-origin') {
      if (utils.isCrossOrigin(url)) {
        failed()
        throw utils.createErr('Fetch API cannot load ' + url + '. Request mode is "same-origin" but the URL\'s origin is not same as the request origin ' + utils.getOrigin(request) + '.')
      }
    }
    xhr._request = request
    if (xhr.onload === undefined) {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          loadFinish()
        }
      }
    } else {
      xhr.onload = loadFinish
    }
    xhr.ontimeout = loadFinish
    xhr.onerror = function () {
      failed()
    }
    request._noA = xhr.onabort === undefined
    xhr.onabort = function () {
      if (!xhrLoadEnd) {
        xhrLoadEnd = true
        failed('ERR_A')
      }
    }
    if (progress) {
      uploadProgress = progress.onUploadProgress
      downloadProgress = progress.onDownloadProgress
      autoCompute = progress.autoCompute
      upload = xhr.upload
      if (uploadProgress && upload) {
        if (autoCompute) {
          loadListener(upload, uploadProgress, progress)
        } else {
          upload.onprogress = uploadProgress
        }
      }
      if (downloadProgress) {
        if (autoCompute) {
          loadListener(xhr, downloadProgress, progress)
        } else {
          xhr.onprogress = downloadProgress
        }
      }
    }
    xhr.open(request.method, url, true)
    utils.headersEach(request.headers, function (value, name) {
      xhr.setRequestHeader(name, value)
    })
    if (reqTimeout) {
      xhr.timeout = reqTimeout
    }
    if (utils.IS_A) {
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

  // 进度监听处理
  function loadListener (target, callback, progress) {
    var handleTime = new Date().getTime()
    var prossQueue = []
    var _progress = utils.IS_DP ? progress._progress : progress
    var meanSpeed = progress.meanSpeed
    _progress.value = 0
    _progress.time = handleTime
    target.onprogress = function (evnt) {
      var currDateTime = new Date().getTime()
      var prevDateTime = _progress.time
      var prevLoaded = _progress.loaded ? _progress.loaded.value : 0
      var total = evnt.total
      var loaded = evnt.loaded
      var speed = (loaded - prevLoaded) / (currDateTime - prevDateTime) * 1000
      if (evnt.lengthComputable) {
        _progress.value = Math.round(loaded / total * 100)
      }
      _progress.total = formatUnit(total, progress)
      _progress.loaded = formatUnit(loaded, progress)
      _progress.speed = formatUnit(speed, progress)
      _progress.time = currDateTime
      _progress.remaining = Math.ceil((total - loaded) / speed)
      prossQueue.push({ total: total, loaded: loaded, speed: speed, evnt: evnt })
      if (!meanSpeed) {
        callback(evnt)
      }
    }
    if (meanSpeed) {
      var speed
      var len
      var index
      var lastItem
      var countSpeed
      var prossInterval = setInterval(function () {
        if (_progress.value < 100) {
          len = prossQueue.length
          if (len) {
            countSpeed = 0
            lastItem = {}
            for (index = 0; index < len; index++) {
              lastItem = prossQueue[0]
              countSpeed += lastItem.speed
            }
            speed = countSpeed / len
            _progress.speed = formatUnit(speed, progress)
            _progress.remaining = Math.ceil((lastItem.total - lastItem.loaded) / speed)
            prossQueue = []
            callback(lastItem.evnt)
          }
        } else {
          clearInterval(prossInterval)
        }
      }, meanSpeed)
    }
  }

  var sUnits = ['B', 'KB', 'MB', 'GB', 'TB']
  var sUnitRatio = 1024
  var sUnitLen = sUnits.length
  function formatUnit (bSize, progress) {
    var unit = ''
    var size = bSize
    var index = 0
    for (; index < sUnitLen; index++) {
      unit = sUnits[index]
      if (size >= sUnitRatio) {
        size = size / sUnitRatio
      } else {
        break
      }
    }
    return { value: bSize, size: parseFloat(size.toFixed(progress.fixed)), unit: unit }
  }

  // 处理响应头
  function parseXHRHeaders (xhr) {
    var rowIndex
    var headers = {}
    var responseHeaders = utils.trim(xhr.getAllResponseHeaders())
    if (responseHeaders) {
      utils.arrayEach(responseHeaders.split('\n'), function (row) {
        rowIndex = row.indexOf(':')
        headers[utils.trim(row.slice(0, rowIndex))] = utils.trim(row.slice(rowIndex + 1))
      })
    }
    return headers
  }

  /**
   * fetch
   * @param { XERequest } request
   * @param { Function } finish
   * @param { Function } failed
   */
  function sendFetch (request, finish, failed) {
    var $fetch = request.$fetch || self.fetch
    var options = {
      _request: request,
      body: request.getBody()
    }
    var reqSignal = request.signal
    utils.arrayEach('method,headers,signal,mode,cache,credentials,redirect,referrer,referrerPolicy,keepalive,integrity'.split(','), function (pro) {
      if (request[pro]) {
        options[pro] = request[pro]
      }
    })
    if (reqSignal && reqSignal.aborted) {
      failed('ERR_A')
    } else {
      $fetch(request.getUrl(), options).then(function (resp) {
        handleExports.toResponse(resp, request).then(finish)
      })['catch'](function (e) {
        failed()
      })
    }
  }

  function getRequest (request, reqSignal) {
    if (!request.progress && !request.timeout) {
      if (request.$fetch) {
        return reqSignal ? sendXHR : sendFetch
      } else if (utils.IS_F) {
        if (utils.IS_FAC) {
          return sendFetch
        }
        return reqSignal ? sendXHR : sendFetch
      }
    }
    return sendXHR
  }

  function createRequestFactory () {
    if (utils.IS_N) {
      /* eslint-disable no-undef */
      return sendHttp
    } else if (utils.IS_F) {
      return function (request) {
        return getRequest(request, request.signal).apply(this, arguments)
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
    var url
    var timer
    var isTimeout = false
    var reqTimeout = request.timeout
    var jsonpCallback = request.jsonpCallback
    var clearTimeoutFn = clearTimeout
    var script = request.script = $dom.createElement('script')
    if (!jsonpCallback) {
      jsonpCallback = request.jsonpCallback = 'jsonp_xe_' + new Date().getTime() + '_' + (++jsonpIndex)
    }
    if (utils.isFn(request.$jsonp)) {
      return request.$jsonp(script, request).then(function (resp) {
        handleExports.toResponse({ status: 200, body: resp }, request).then(finish)
      })['catch'](function () {
        failed()
      })
    } else {
      url = request.getUrl()
      $global[jsonpCallback] = function (body) {
        if (!isTimeout) {
          clearTimeoutFn(timer)
          jsonpClear(request, jsonpCallback)
          finish({ status: 200, body: body })
        }
      }
      script.type = 'text/javascript'
      script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + request.jsonp + '=' + jsonpCallback
      script.onerror = function () {
        if (!isTimeout) {
          clearTimeoutFn(timer)
          jsonpClear(request, jsonpCallback)
          failed()
        }
      }
      if (reqTimeout) {
        timer = setTimeout(function () {
          isTimeout = true
          jsonpClear(request, jsonpCallback)
          finish({ status: 0, body: null })
        }, reqTimeout)
      }
      $dom.body.appendChild(script)
    }
  }

  function jsonpClear (request, jsonpCallback, UNDEFINED) {
    var script = request.script
    var $body = $dom.body
    if (script.parentNode === $body) {
      $body.removeChild(script)
    }
    try {
      delete $global[jsonpCallback]
    } catch (e) {
      // IE8
      $global[jsonpCallback] = UNDEFINED
    }
  }

  var errorMessage = {
    ERR_A: 'The user aborted a request',
    ERR_F: 'Network request failed'
  }

  function handleDefaultHeader (request) {
    var reqHeaders = request.headers
    var reqBody = request.body
    var reqMethod = request.method
    if (reqBody && reqMethod !== 'GET' && reqMethod !== 'HEAD') {
      if (!utils.isFData(reqBody)) {
        reqHeaders.set('Content-Type', utils.isURLSParams(reqBody) || request.bodyType === 'form-data' ? 'application/x-www-form-urlencoded' : 'application/json; charset=utf-8')
      }
    }
    if (utils.isCrossOrigin(request.getUrl())) {
      reqHeaders.set('X-Requested-With', 'XMLHttpRequest')
    }
  }

  /**
    * 支持: nodejs、browser
    *
    * @param { Object} options
    * @return { Promise }
    */
  function XEAjax (options) {
    var opts = utils.assign({}, setupDefaults, { headers: utils.assign({}, setupDefaults.headers) }, options)
    var request = new XERequest(opts)
    return new Promise(function (resolve, reject) {
      handleDefaultHeader(request)
      return interceptorExports.requests(request).then(function () {
        (request.jsonp ? sendJSONP : fetchRequest)(request, function (response) {
          interceptorExports.toResolves(request, handleExports.toResponse(response, request), resolve, reject)
        }, function (type) {
          interceptorExports.toRejects(request, utils.createErr(errorMessage[type || 'ERR_F']), resolve, reject)
        })
      })
    })
  }

  XEAjax.interceptors = interceptorExports.interceptors
  XEAjax.serialize = utils.serialize
  XEAjax.Progress = XEProgress
  XEAjax.AbortController = XEAbortController
  XEAjax.headers = XEHeaders
  XEAjax.request = XERequest
  XEAjax.response = XEResponse

  /**
   * Installation
   */
  XEAjax.use = function (plugin) {
    plugin.install(XEAjax)
  }

  /**
   * 参数说明
   *
   * 基础参数
   * @param { String } url 请求地址
   * @param { String } baseURL 基础路径，默认上下文路径
   * @param { String } method 请求方法(默认GET)
   * @param { Object } params 请求参数，序列化后会拼接在url
   * @param { Object } body 提交参数
   * @param { String } bodyType 提交参数方式可以设置json-data,form-data(json-data)
   * @param { String } jsonp 调用jsonp服务,回调属性默认callback
   * @param { Number } timeout 设置超时
   * @param { Object } headers 请求头
   * @param { Function } transformParams(params, request) 用于改变URL参数
   * @param { Function } paramsSerializer(params, request) 自定义URL序列化函数
   * @param { Function } transformBody(body, request) 用于改变提交数据
   * @param { Function } stringifyBody(body, request) 自定义转换提交数据的函数
   * @param { Function } validateStatus(response) 自定义校验请求是否成功
   * 只有在支持 fetch 的环境下才有效
   * @param { String } cache 处理缓存方式,可以设置default,no-store,no-cache,reload,force-cache,only-if-cached(默认default)
   * @param { String } credentials 设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include(默认same-origin)
   * @param { String } referrer 可以设置: no-referrer,client或URL(默认client)
   * @param { String } referrerPolicy 可以设置: no-referrer,no-referrer-when-downgrade,origin,origin-when-cross-origin,unsafe-url
   * @param { String } integrity 包括请求的subresource integrity值
   * 高级参数(不建议使用))
   * @param { Function } $XMLHttpRequest 自定义 XMLHttpRequest 请求函数
   * @param { Function } $http 自定义 http 请求函数
   * @param { Function } $fetch 自定义 fetch 请求函数
   * @param { Function } $jsonp 自定义 jsonp 处理函数
   * @param { Function } $options 自定义参数
   */
  XEAjax.setup = function (options) {
    utils.assign(setupDefaults, options)
  }

  function getOptions (method, def, options) {
    var opts = utils.assign({ method: method }, def, options)
    return opts
  }

  function responseHeaders (response) {
    var result = {}
    utils.headersEach(response.headers, function (value, key) {
      result[key] = value
    })
    return result
  }

  // To fetch Response
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
      return XEAjax(opts)['catch'](function (e) {
        return Promise.reject(getResponseSchema(isRespSchema, '', 'failed', e.message || e, {}), this)
      }).then(function (response) {
        return new Promise(function (resolve, reject) {
          var finish = response.ok ? resolve : reject
          response.text().then(function (data) {
            try {
              return JSON.parse(data)
            } catch (e) {
              return data
            }
          })['catch'](function (e) {
            return ''
          }).then(function (data) {
            finish(getResponseSchema(isRespSchema, data, response.status, response.statusText, responseHeaders(response)))
          })
        }, this)
      })
    }
  }

  // To Response
  function requestToResponse (method) {
    return createResponseSchema(method, true)
  }

  // To JSON
  function requestToJSON (method) {
    return createResponseSchema(method)
  }

  // 和 Promise.all 类似，支持传对象参数
  function doAll (iterable) {
    return Promise.all(iterable.map(function (item) {
      if (item instanceof Promise) {
        return item
      }
      return utils.isObj(item) ? XEAjax(item) : item
    }))
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

    get: requestToJSON(requestGet),
    post: requestToJSON(requestPost),
    put: requestToJSON(requestPut),
    delete: requestToJSON(requestDelete),
    patch: requestToJSON(requestPatch),
    head: requestToJSON(requestHead),
    jsonp: requestToJSON(requestJsonp)
  }

  /**
   * 混合函数
   *
   * @param {Object} methods
   */
  XEAjax.mixin = function (methods) {
    utils.objectEach(methods, function (fn, name) {
      XEAjax[name] = utils.isFn(fn) ? function () {
        var result = fn.apply(XEAjax.$context, arguments)
        XEAjax.$context = null
        return result
      } : fn
    })
  }

  utils.assign(XEAjax, ajaxExports)

  return XEAjax
}))
