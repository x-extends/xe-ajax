import { objectAssign, arrayEach } from './util'
import { XEHeaders } from './headers'

function XEReadableStream (xhr, request) {
  this.locked = false
  this._xhr = xhr
  this._request = request
}

objectAssign(XEReadableStream.prototype, {
  _getBody: function () {
    var that = this
    var xhr = this._xhr
    var request = this._request
    var XEPromise = request.$Promise || Promise
    return new XEPromise(function (resolve, reject) {
      var body = {responseText: '', response: xhr}
      if (xhr && xhr.response !== undefined && xhr.status !== undefined) {
        if (xhr.responseText) {
          body.responseText = xhr.responseText
          try {
            body.response = JSON.parse(xhr.responseText)
          } catch (e) {
            body.response = null
          }
        } else {
          body.response = xhr.response
          body.responseText = JSON.stringify(xhr.response)
        }
      } else {
        body.responseText = JSON.stringify(body.response)
      }
      if (that.locked) {
        reject(new TypeError('body stream already read'))
      } else {
        that.locked = true
        resolve(body)
      }
    }, request.$context)
  }
})

export function XEAjaxResponse (request, xhr) {
  var that = this
  var $resp = {}

  $resp.body = new XEReadableStream(xhr, request)
  $resp.bodyUsed = false
  $resp.url = request.url
  $resp.headers = new XEHeaders()
  $resp.status = 0
  $resp.statusText = ''
  $resp.ok = false
  $resp.redirected = false
  $resp.type = 'basic'

  arrayEach(['body', 'bodyUsed', 'url', 'headers', 'status', 'statusText', 'ok', 'redirected', 'type'], function (name) {
    Object.defineProperty(that, name, {
      get: function () {
        return $resp[name]
      }
    })
  })

  this.json = function () {
    return this.body._getBody().then(function (body) {
      $resp.bodyUsed = true
      return body.response
    })
  }

  this.text = function () {
    return $resp.body._getBody().then(function (body) {
      $resp.bodyUsed = true
      return body.responseText
    })
  }

  // xhr handle
  if (xhr && xhr.response !== undefined && xhr.status !== undefined) {
    $resp.status = xhr.status
    $resp.redirected = $resp.status === 302
    $resp.ok = request.getPromiseStatus(this)

    // if no content
    if ($resp.status === 1223 || $resp.status === 204) {
      $resp.statusText = 'No Content'
    } else if ($resp.status === 304) {
      // if not modified
      $resp.statusText = 'Not Modified'
    } else {
      // statusText
      $resp.statusText = (xhr.statusText || $resp.statusText).trim()
    }

    // parse headers
    if (xhr.getAllResponseHeaders) {
      var allResponseHeaders = xhr.getAllResponseHeaders().trim()
      if (allResponseHeaders) {
        arrayEach(allResponseHeaders.split('\n'), function (row) {
          var index = row.indexOf(':')
          $resp.headers.set(row.slice(0, index).trim(), row.slice(index + 1).trim())
        })
      }
    }
  }
}

export default XEAjaxResponse
