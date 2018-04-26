'use strict'

function XEReadableStream (body, request, response) {
  this.locked = false
  this._getBody = function () {
    var that = this
    var XEPromise = request.$Promise || Promise
    response._response.bodyUsed = true
    return new XEPromise(function (resolve, reject) {
      if (that.locked) {
        reject(new TypeError('body stream already read'))
      } else {
        that.locked = true
        resolve(body)
      }
    }, request.$context)
  }
}

module.exports = XEReadableStream
