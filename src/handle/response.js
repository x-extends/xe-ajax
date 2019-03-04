'use strict'

var utils = require('../core/utils')
var XEReadableStream = require('./readableStream')
var XEHeaders = require('./headers')

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
