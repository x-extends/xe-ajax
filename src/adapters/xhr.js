'use strict'

var utils = require('../core/utils')
var XEResponse = require('../handle/response')

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
  var progress = request.progress
  var loadFinish = function () {
    finish(new XEResponse(xhr[utils.IS_A ? 'response' : 'responseText'], {
      status: xhr.status,
      statusText: xhr.statusText,
      headers: parseXHRHeaders(xhr)
    }, request))
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
  xhr.onerror = function () {
    failed()
  }
  xhr.ontimeout = function () {
    failed('ERR_T')
  }
  xhr.onabort = function () {
    failed('ERR_A')
  }
  if (progress) {
    var uploadProgress = progress.onUploadProgress
    var downloadProgress = progress.onDownloadProgress
    var autoCompute = progress.autoCompute
    var upload = xhr.upload
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
  if (utils.IS_A) {
    xhr.responseType = 'blob'
  }
  if (reqCredentials === 'include') {
    xhr.withCredentials = true
  } else if (reqCredentials === 'omit') {
    xhr.withCredentials = false
  }
  if (reqTimeout) {
    setTimeout(function () {
      xhr.abort()
    }, reqTimeout)
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
  var _progress = utils.IS_DEF ? progress._progress : progress
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
    prossQueue.push({total: total, loaded: loaded, speed: speed, evnt: evnt})
    if (!meanSpeed) {
      callback(evnt)
    }
  }
  if (meanSpeed) {
    var prossInterval = setInterval(function () {
      if (_progress.value < 100) {
        var len = prossQueue.length
        if (len) {
          var countSpeed = 0
          var lastItem = null
          for (var index = 0; index < len; index++) {
            lastItem = prossQueue[0]
            countSpeed += lastItem.speed
          }
          var speed = countSpeed / len
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
  for (var index = 0; index < sUnitLen; index++) {
    unit = sUnits[index]
    if (size >= sUnitRatio) {
      size = size / sUnitRatio
    } else {
      break
    }
  }
  return {value: bSize, size: parseFloat(size.toFixed(progress.fixed)), unit: unit}
}

// 处理响应头
function parseXHRHeaders (xhr) {
  var headers = {}
  var headerList = utils.trim(xhr.getAllResponseHeaders()).split('\n')
  var len = headerList.length
  for (var row, rowIndex, index = 0; index < len; index++) {
    row = headerList[index]
    rowIndex = row.indexOf(':')
    headers[utils.trim(row.slice(0, rowIndex))] = utils.trim(row.slice(rowIndex + 1))
  }
  return headers
}

module.exports = sendXHR
