import { arrayEach, objectAssign } from '../core/utils'

var requestList = []

/**
 * 索引 XHR Request 是否存在
 * @param { XERequest } item 对象
 */
function getIndex (item) {
  for (var index = 0, len = requestList.length; index < len; index++) {
    if (item === requestList[index][0]) {
      return index
    }
  }
}

export function XEAbortSignal () {
  var $signal = {aborted: false}
  Object.defineProperty(this, 'aborted', {
    get: function () {
      return $signal.aborted
    }
  })
}

objectAssign(XEAbortSignal.prototype, {
  // 将 Request 注入控制器
  install: function (request) {
    if (request.signal) {
      var index = getIndex(request.signal)
      if (index === undefined) {
        requestList.push([request.signal, [request]])
      } else {
        requestList[index][1].push(request)
      }
    }
  }
})

export function XEAbortController () {
  this.signal = new XEAbortSignal()
}

objectAssign(XEAbortController.prototype, {
  // 中止请求
  abort: function () {
    var index = getIndex(this.signal)
    if (index !== undefined) {
      arrayEach(requestList[index][1], function (request) {
        request.abort()
      })
      requestList.splice(index, 1)
    }
  }
})

export default XEAbortController
