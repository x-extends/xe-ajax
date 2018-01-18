import { isFunction, isFormData, isCrossOrigin, serialize } from './util'

export function XEAjaxRequest (options) {
  Object.assign(this, options)
  this._afterSends = []
  this._options = options
  this.method = String(this.method).toLocaleUpperCase()
  this.crossOrigin = isCrossOrigin(this)
  if (options && options.jsonp) {
    this.script = document.createElement('script')
  } else {
    this.xhr = new XMLHttpRequest()
  }
}

Object.assign(XEAjaxRequest.prototype, {
  abort: function () {
    this.xhr.abort()
  },
  setHeader: function (name, value) {
    this.headers[name] = value
  },
  getHeader: function () {
    return this.headers[name]
  },
  deleteHeader: function (name) {
    delete this.headers[name]
  },
  clearHeader: function () {
    this.headers = {}
  },
  getUrl: function () {
    var url = this.url
    var params = ''
    if (url) {
      if (this.params && !isFormData(this.params)) {
        params = isFunction(this.paramsSerializer) ? this.paramsSerializer(this) : serialize(this.params)
      }
      if (params) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + params
      }
      if (/\w+:\/{2}.*/.test(url)) {
        return url
      }
      return this.baseURL.replace(/\/$/, '') + '/' + url.replace(/^\//, '')
    }
    return url
  },
  getBody: function () {
    var result = null
    if (this.body && this.method !== 'GET') {
      try {
        if (isFormData(this.body)) {
          result = this.body
        } else if (this.bodyType === 'FROM_DATA') {
          result = serialize(this.body)
        } else {
          result = JSON.stringify(this.body)
        }
      } catch (e) {
        console.error(e)
      }
      if (isFunction(this.transformBody)) {
        return this.transformBody(result, this)
      }
    }
    return result
  }
})

export default XEAjaxRequest
