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
  this._abortSignal = {aborted: false}
}

Object.defineProperty($AbortSignal, 'aborted', {
  get: function () {
    return this._abortSignal.aborted
  }
})

objectAssign($AbortSignal.prototype, {
  // 将 Request 注入控制器
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
  // 中止请求
  abort: function () {
    var index = getSignalIndex(this.signal)
    if (index !== undefined) {
      arrayEach(requestList[index][1], function (request) {
        request.abort()
      })
      requestList.splice(index, 1)
    }
  }
})

export var XEAbortSignal = $AbortSignal
export var XEAbortController = $AbortController
