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

XEAbortSignalPolyfill.prototype.install = function (request) {
  var reqSignal = request.signal
  if (reqSignal) {
    var index = getSignalIndex(reqSignal)
    if (index === undefined) {
      requestList.push([reqSignal, [request]])
    } else {
      requestList[index][1].push(request)
    }
  }
}

function XEAbortControllerPolyfill () {
  this.signal = new XEAbortSignalPolyfill()
}

// Abort Request
XEAbortControllerPolyfill.prototype.abort = function () {
  var index = getSignalIndex(this.signal)
  if (index !== undefined) {
    var requestItem = requestList[index]
    utils.arrayEach(requestItem[1], function (request) {
      request.abort()
      requestItem[0]._abortSignal.aborted = true
    })
    requestList.splice(index, 1)
  }
}

/* eslint-disable no-undef */
var XEAbortController = typeof AbortController === 'undefined' ? XEAbortControllerPolyfill : AbortController

module.exports = XEAbortController
