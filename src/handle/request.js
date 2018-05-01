'use strict'

var utils = require('../core/utils')
var XEHeaders = require('./headers')

function XERequest (options) {
  utils.objectAssign(this, {url: '', body: null, params: null, signal: null}, options)
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
    var _param = utils.arrayIndexOf(['no-store', 'no-cache', 'reload'], this.cache) === -1 ? {} : {_t: Date.now()}
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
      return (utils.isNodeJS ? '' : location.protocol) + url
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

module.exports = XERequest
