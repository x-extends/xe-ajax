'use strict'

var utils = require('../core/utils')
var XEHeaders = require('./headers')

function XERequest (options) {
  utils.objectAssign(this, {url: '', body: null, params: null, signal: null}, options)
  this.headers = new XEHeaders(options.headers)
  this.method = String(this.method).toLocaleUpperCase()
  this.bodyType = String(this.bodyType).toLowerCase()
  if (this.signal && utils.isFunction(this.signal.install)) {
    this.signal.install(this)
  }
}

utils.objectAssign(XERequest.prototype, {
  abort: function () {
    if (this.xhr) {
      this.xhr.abort()
    }
    this.$abort = true
  },
  getUrl: function () {
    var url = this.url
    var params = ''
    if (url) {
      if (utils.isFunction(this.transformParams)) {
        this.params = this.transformParams(this.params || {}, this)
      }
      if (this.params && !utils.isFormData(this.params)) {
        var _param = utils.arrayIncludes(['no-store', 'no-cache', 'reload'], this.cache) ? {_t: Date.now()} : {}
        params = utils.isString(this.params) ? this.params : (utils.isFunction(this.paramsSerializer) ? this.paramsSerializer : utils.serialize)(utils.objectAssign(_param, this.params), this)
      }
      if (params) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + params
      }
      if (/\w+:\/{2}.*/.test(url)) {
        return url
      }
      if (url.indexOf('/') === 0) {
        return utils.getLocatOrigin() + url
      }
      return this.baseURL.replace(/\/$/, '') + '/' + url
    }
    return url
  },
  getBody: function () {
    var result = null
    var body = this.body
    if (body && this.method !== 'GET' && this.method !== 'HEAD') {
      try {
        if (utils.isFunction(this.transformBody)) {
          body = this.body = this.transformBody(body, this) || body
        }
        if (utils.isFunction(this.stringifyBody)) {
          result = this.stringifyBody(body, this) || null
        } else {
          if (utils.isFormData(body)) {
            result = body
          } else {
            result = utils.isString(body) ? body : (this.bodyType === 'form-data' || this.bodyType === 'form_data' ? utils.serialize(body) : JSON.stringify(body))
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    return result
  }
})

module.exports = XERequest
