'use strict'

var utils = require('../core/utils')
var XEReadableStream = require('./readableStream')
var XEHeaders = require('./headers')

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

if (utils.isSupportAdvanced) {
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
      text.trim().split('&').forEach(function (bytes) {
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

module.exports = XEResponse
