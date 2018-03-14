import { isFunction, isFormData, isCrossOrigin, arrayIncludes, serialize, objectAssign, getLocatOrigin } from '../core/utils'
import { XEHeaders } from '../handle/headers'

export function XERequest (options) {
  objectAssign(this, {url: '', body: null, params: null, signal: null}, options)
  this.headers = new XEHeaders(options.headers)
  this.method = String(this.method).toLocaleUpperCase()
  this.bodyType = String(this.bodyType).toLocaleUpperCase()
  this.crossOrigin = isCrossOrigin(this)
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
        params = (isFunction(this.paramsSerializer) ? this.paramsSerializer : serialize)(objectAssign(arrayIncludes(['no-store', 'no-cache', 'reload'], this.cache) ? {_: Date.now()} : {}, this.params), this)
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
    var request = this
    var XEPromise = request.$Promise || Promise
    return new XEPromise(function (resolve, reject) {
      var result = null
      if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
        try {
          if (isFunction(request.transformBody)) {
            request.body = request.transformBody(request.body || {}, request) || request.body
          }
          if (isFunction(request.stringifyBody)) {
            result = request.stringifyBody(request.body, request) || null
          } else {
            if (isFormData(request.body)) {
              result = request.body
            } else if (request.bodyType === 'FORM_DATA') {
              result = serialize(request.body)
            } else {
              result = JSON.stringify(request.body)
            }
          }
        } catch (e) {
          console.error(e)
        }
      }
      resolve(result)
    }, request.$context)
  }
})
