import { isString, isFunction, isFormData, arrayIncludes, serialize, objectAssign, getLocatOrigin } from '../core/utils'
import { XEHeaders } from '../handle/headers'

export function XERequest (options) {
  objectAssign(this, {url: '', body: null, params: null, signal: null}, options)
  this.headers = new XEHeaders(options.headers)
  this.method = String(this.method).toLocaleUpperCase()
  this.bodyType = String(this.bodyType).toLowerCase()
  if (this.signal && isFunction(this.signal.install)) {
    this.signal.install(this)
  }
}

objectAssign(XERequest.prototype, {
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
      if (isFunction(this.transformParams)) {
        this.params = this.transformParams(this.params || {}, this)
      }
      if (this.params && !isFormData(this.params)) {
        var _param = arrayIncludes(['no-store', 'no-cache', 'reload'], this.cache) ? {_t: Date.now()} : {}
        params = isString(this.params) ? this.params : (isFunction(this.paramsSerializer) ? this.paramsSerializer : serialize)(objectAssign(_param, this.params), this)
      }
      if (params) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + params
      }
      if (/\w+:\/{2}.*/.test(url)) {
        return url
      }
      if (url.indexOf('/') === 0) {
        return getLocatOrigin() + url
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
        if (isFunction(this.transformBody)) {
          body = this.body = this.transformBody(body, this) || body
        }
        if (isFunction(this.stringifyBody)) {
          result = this.stringifyBody(body, this) || null
        } else {
          if (isFormData(body)) {
            result = body
          } else {
            result = isString(body) ? body : (this.bodyType === 'form-data' || this.bodyType === 'form_data' ? serialize(body) : JSON.stringify(body))
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    return result
  }
})
