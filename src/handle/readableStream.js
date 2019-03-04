'use strict'

var utils = require('../core/utils')

function XEReadableStream (body, request, response) {
  this.locked = false
  this._getBody = function () {
    var stream = this
    var XEPromise = request.$Promise || Promise
    if (utils.IS_DP) {
      response._response.bodyUsed = true
    } else {
      response.bodyUsed = true
    }
    return new XEPromise(function (resolve, reject) {
      if (stream.locked) {
        reject(utils.createErr('body stream already read'))
      } else {
        stream.locked = true
        resolve(body)
      }
    }, request.$context)
  }
}

module.exports = XEReadableStream
