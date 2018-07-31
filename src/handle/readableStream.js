'use strict'

function XEReadableStream (body, request, response) {
  this.locked = false
  this._getBody = function () {
    var stream = this
    var XEPromise = request.$Promise || Promise
    response._response.bodyUsed = true
    return new XEPromise(function (resolve, reject) {
      if (stream.locked) {
        reject(new TypeError('body stream already read'))
      } else {
        stream.locked = true
        resolve(body)
      }
    }, request.$context)
  }
}

module.exports = XEReadableStream
