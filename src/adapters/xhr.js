'use strict'

var utils = require('../core/utils')
var handleExports = require('../handle')

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

module.exports = sendXHR
