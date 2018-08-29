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
  return -1
}

XEAbortSignalPolyfill.prototype.install = function (request) {
  var reqSignal = request.signal
  if (reqSignal) {
    var index = getSignalIndex(reqSignal)
    if (index > -1) {
      requestList[index][1].push(request)
    } else {
      requestList.push([reqSignal, [request]])
    }
  }
}

function XEAbortControllerPolyfill () {
  this.signal = new XEAbortSignalPolyfill()
}

// Abort Request
XEAbortControllerPolyfill.prototype.abort = function () {
  var index = getSignalIndex(this.signal)
  if (index > -1) {
    var requestItem = requestList[index]
    utils.arrayEach(requestItem[1], function (request) {
      var item = requestItem[0]
      request.abort()
      if (utils.IS_DEF) {
        item.D_AS.aborted = true
      } else {
        item.aborted = true
      }
    })
    requestList.splice(index, 1)
  }
}

/* eslint-disable no-undef */
var XEAbortController = utils.IS_FAC ? AbortController : XEAbortControllerPolyfill

module.exports = XEAbortController
