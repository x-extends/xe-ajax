import { isFunction, isFormData, isCrossOrigin, serialize } from './util'
import { setRequest } from './cancelXHR'

export function XEAjaxRequest (options) {
  Object.assign(this, {url: '', body: null, params: null, cancelToken: null}, options)
  this.ABORT_RESPONSE = undefined
  this.method = String(this.method).toLocaleUpperCase()
  this.crossOrigin = isCrossOrigin(this)
  if (options && options.jsonp) {
    this.script = document.createElement('script')
  } else {
    this.xhr = options.getXMLHttpRequest(this)
  }
  setRequest(this)
}

Object.assign(XEAjaxRequest.prototype, {
  abort: function (response) {
    this.xhr.abort(response)
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
    var request = this
    return new Promise(function (resolve, reject) {
      var result = null
      if (request.body && request.method !== 'GET') {
        try {
          if (isFunction(request.transformBody)) {
            request.body = request.transformBody(request.body, request) || request.body
          }
          if (isFunction(request.stringifyBody)) {
            result = request.stringifyBody(request.body, request) || null
          } else {
            if (isFormData(request.body)) {
              result = request.body
            } else if (String(request.bodyType).toLocaleUpperCase() === 'FROM_DATA') {
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
    })
  }
})

export default XEAjaxRequest
