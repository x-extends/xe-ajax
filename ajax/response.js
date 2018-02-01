function XEReadableStream (xhr) {
  this.locked = false
  this._xhr = xhr
}

Object.assign(XEReadableStream.prototype, {
  _getBody: function () {
    var that = this
    var xhr = this._xhr
    return new Promise(function (resolve, reject) {
      var body = {responseText: '', response: xhr}
      if (xhr && xhr.response !== undefined && xhr.status !== undefined) {
        if (xhr.responseText) {
          body.responseText = xhr.responseText
          body.response = JSON.parse(xhr.responseText)
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
    })
  }
})

export function XEAjaxResponse (request, xhr) {
  var that = this
  this.body = new XEReadableStream(xhr)
  this.bodyUsed = false
  this.url = request.url
  this.headers = {}
  this.status = 0
  this.statusText = ''
  this.ok = false
  this.redirected = false

  this.json = function () {
    return this.body._getBody().then(function (body) {
      that.bodyUsed = true
      return body.response
    })
  }

  this.text = function () {
    return this.body._getBody().then(function (body) {
      that.bodyUsed = true
      return body.responseText
    })
  }

  // xhr handle
  if (xhr && xhr.response !== undefined && xhr.status !== undefined) {
    this.status = xhr.status
    this.redirected = this.status === 302
    this.ok = request.getPromiseStatus(this)

    // if no content
    if (this.status === 1223 || this.status === 204) {
      this.statusText = 'No Content'
    } else if (this.status === 304) {
      // if not modified
      this.statusText = 'Not Modified'
    } else {
      // statusText
      this.statusText = (xhr.statusText || this.statusText).trim()
    }

    // parse headers
    if (xhr.getAllResponseHeaders) {
      var allResponseHeaders = xhr.getAllResponseHeaders().trim()
      if (allResponseHeaders) {
        allResponseHeaders.split('\n').forEach(function (row) {
          var index = row.indexOf(':')
          this.headers[row.slice(0, index).trim()] = row.slice(index + 1).trim()
        }, this)
      }
    }
  }
}

export default XEAjaxResponse
