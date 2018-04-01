import { isString, isSupportAdvanced, objectAssign, arrayEach } from '../core/utils'
import { XEReadableStream } from './readableStream'
import { XEHeaders } from '../handle/headers'

export function XEResponse (body, options, request) {
  this._body = body
  this._request = request
  this._response = {
    body: new XEReadableStream(body, request),
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

arrayEach(['body', 'bodyUsed', 'url', 'headers', 'status', 'statusText', 'ok', 'redirected', 'type'], function (name) {
  Object.defineProperty(XEResponse.prototype, name, {
    get: function () {
      return this._response[name]
    }
  })
})

objectAssign(XEResponse.prototype, {
  clone: function () {
    return new XEResponse(this._body, {status: this.status, statusText: this.statusText, headers: this.headers}, this._request)
  },
  json: function () {
    return this.text().then(function (text) {
      return JSON.parse(text)
    })
  },
  text: function () {
    return this.body._getBody()
  }
})

if (isSupportAdvanced()) {
  objectAssign(XEResponse.prototype, {
    text: function () {
      var request = this._request
      return this.blob().then(function (blob) {
        var fileReader = new FileReader()
        var result = fileReaderReady(request, fileReader)
        fileReader.readAsText(blob)
        return result
      })
    },
    blob: function () {
      return this.body._getBody()
    },
    arrayBuffer: function () {
      var request = this._request
      return this.blob().then(function (blob) {
        var fileReader = new FileReader()
        var result = fileReaderReady(request, fileReader)
        fileReader.readAsArrayBuffer(blob)
        return result
      })
    },
    formData: function () {
      return this.text().then(function (text) {
        var formData = new FormData()
        text.trim().split('&').forEach(function (bytes) {
          if (bytes) {
            var split = bytes.split('=')
            var name = split.shift().replace(/\+/g, ' ')
            var value = split.join('=').replace(/\+/g, ' ')
            formData.append(decodeURIComponent(name), decodeURIComponent(value))
          }
        })
        return formData
      })
    }
  })
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

// result to Response
export function toResponse (resp, request) {
  if ((typeof Response === 'function' && resp.constructor === Response) || resp.constructor === XEResponse) {
    return resp
  }
  var options = {status: resp.status, statusText: resp.statusText, headers: resp.headers}
  if (isSupportAdvanced()) {
    return new XEResponse(resp.body instanceof Blob ? resp.body : new Blob([isString(resp.body) ? resp.body : JSON.stringify(resp.body)]), options, request)
  }
  return new XEResponse(isString(resp.body) ? resp.body : JSON.stringify(resp.body), options, request)
}
