'use strict'

var utils = require('../core/utils')
var XEHeaders = require('./headers')

function XERequest (options) {
  utils.assign(this, {url: '', body: '', params: '', signal: ''}, options)
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
    var _param = utils.includes(['no-store', 'no-cache', 'reload'], this.cache) ? {_t: Date.now()} : {}
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

module.exports = XERequest
