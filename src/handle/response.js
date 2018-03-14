import { objectAssign, arrayEach } from '../core/utils'
import { XEReadableStream } from './readableStream'
import { XEHeaders } from '../handle/headers'

export function XEResponse (body, options, request) {
  this._request = request
  this._response = {
    body: new XEReadableStream(body, request),
    bodyUsed: false,
    url: request.url,
    status: options.status,
    statusText: options.statusText,
    redirected: options.status === 302,
    headers: new XEHeaders(options.headers),
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
    return new XEResponse(this.body, this, this._request)
  },
  json: function () {
    return this.text().then(function (text) {
      return JSON.parse(text)
    })
  },
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

  }
})

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
