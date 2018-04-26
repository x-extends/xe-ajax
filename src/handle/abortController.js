'use strict'

var utils = require('../core/utils')
var XEAbortSignalPolyfill = require('./abortSignal')
var requestList = []

function getSignalIndex (item) {
  for (var index = 0, len = requestList.length; index < len; index++) {
    if (item === requestList[index][0]) {
      return index
    }
  }
}

utils.objectAssign(XEAbortSignalPolyfill.prototype, {
  install: function (request) {
    if (request.signal) {
      var index = getSignalIndex(request.signal)
      if (index === undefined) {
        requestList.push([request.signal, [request]])
      } else {
        requestList[index][1].push(request)
      }
    }
  }
})

function XEAbortControllerPolyfill () {
  this.signal = new XEAbortSignalPolyfill()
}

utils.objectAssign(XEAbortControllerPolyfill.prototype, {
  // Abort Request
  abort: function () {
    var index = getSignalIndex(this.signal)
    if (index !== undefined) {
      utils.arrayEach(requestList[index][1], function (request) {
        request.abort()
        requestList[index][0]._abortSignal.aborted = true
      })
      requestList.splice(index, 1)
    }
  }
})

var XEAbortController = typeof AbortController === 'function' ? AbortController : XEAbortControllerPolyfill

module.exports = XEAbortController
