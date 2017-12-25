import { isFormData, isCrossOrigin, serialize } from './util'

export function XEAjaxRequest (options) {
  Object.assign(this, options)
  this._afterSends = []
  this._options = options
  this.method = this.method.toLowerCase()
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
      if (!isFormData(this.params)) {
        params = this.params ? serialize(this.params) : ''
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
    if (this.body && this.method !== 'get') {
      if (isFormData(this.body)) {
        return this.body
      }
      if (this.bodyMode === 'formData') {
        return serialize(this.body)
      }
      try {
        return JSON.stringify(this.body)
      } catch (e) {
        console.error(e)
      }
    }
    return null
  }
})
