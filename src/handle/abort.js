import { arrayEach, objectAssign } from '../core/utils'

var requestList = []

function getSignalIndex (item) {
  for (var index = 0, len = requestList.length; index < len; index++) {
    if (item === requestList[index][0]) {
      return index
    }
  }
}

function $AbortSignal () {
  this.onaborted = null
  this._abortSignal = {aborted: false}
}

Object.defineProperty($AbortSignal.prototype, 'aborted', {
  get: function () {
    return this._abortSignal.aborted
  }
})

objectAssign($AbortSignal.prototype, {
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

function $AbortController () {
  this.signal = new XEAbortSignal()
}

objectAssign($AbortController.prototype, {
  // Abort Request
  abort: function () {
    var index = getSignalIndex(this.signal)
    if (index !== undefined) {
      arrayEach(requestList[index][1], function (request) {
        request.abort()
        requestList[index][0]._abortSignal.aborted = true
      })
      requestList.splice(index, 1)
    }
  }
})

/* eslint-disable no-undef */
export var XEAbortSignal = typeof AbortSignal === 'function' ? AbortSignal : $AbortSignal
export var XEAbortController = typeof AbortController === 'function' ? AbortController : $AbortController
