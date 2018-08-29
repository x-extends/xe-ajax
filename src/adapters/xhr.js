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
    failed('E_T')
  }
  xhr.onabort = function () {
    failed('E_A')
  }
  if (progress) {
    var onupload = progress.onupload
    var onload = progress.onload
    var upload = xhr.upload
    if (onupload && upload) {
      loadListener(upload, onupload, progress)
    }
    if (onload) {
      loadListener(xhr, onload, progress)
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
  var prepareFn = function () {
    progress.time = new Date().getTime()
  }
  target.onloadstart = prepareFn
  target.onprogress = function (evnt) {
    var prevDateTime = progress.time
    var currDateTime = new Date().getTime()
    var prevLoaded = progress.loaded
    var total = evnt.total
    var loaded = evnt.loaded
    if (evnt.lengthComputable) {
      progress.value = Math.round(loaded / total * 100)
    }
    progress.total = total
    progress.loaded = loaded
    progress.time = currDateTime
    progress.speed = (loaded - prevLoaded) / (currDateTime - prevDateTime) * 1000
    callback(evnt)
  }
  target.onloadend = prepareFn
}

// 处理响应头
function parseXHRHeaders (xhr) {
  var headers = {}
  var allResponseHeaders = utils.trim(xhr.getAllResponseHeaders())
  utils.arrayEach(allResponseHeaders.split('\n'), function (row) {
    var index = row.indexOf(':')
    headers[utils.trim(row.slice(0, index))] = utils.trim(row.slice(index + 1))
  })
  return headers
}

module.exports = sendXHR
