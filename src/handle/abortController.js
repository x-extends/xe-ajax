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

/**
 * 取消控制器
 *
 * @param {XERequest} request XERequest 对象
 */
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

XEAbortControllerPolyfill.prototype.abort = function () {
  var index = getSignalIndex(this.signal)
  if (index > -1) {
    var requestItem = requestList[index]
    utils.arrayEach(requestItem[1], function (request) {
      var item = requestItem[0]
      request.abort()
      if (utils.IS_DP) {
        item._store.aborted = true
      } else {
        item.aborted = true
      }
    })
    requestList.splice(index, 1)
  }
}

var XEAbortController = XEAbortControllerPolyfill

module.exports = XEAbortController
