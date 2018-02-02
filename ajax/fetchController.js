var requestList = []

/**
 * 索引 XHR Request 是否存在
 * @param { XEAjaxRequest } item 对象
 */
function getIndex (item) {
  for (var index = 0, len = requestList.length; index < len; index++) {
    if (item === requestList[index][0]) {
      return index
    }
  }
}

/**
 * 将可取消的 XHR Request 放入队列
 *
 * @param { XEAjaxRequest } request 对象
 */
export function setFetchRequest (request) {
  if (request.signal) {
    var index = getIndex(request.signal)
    if (index === undefined) {
      requestList.push([request.signal, [request]])
    } else {
      requestList[index][1].push(request)
    }
  }
}

export function XEFetchSignal () {}

export function XEFetchController () {
  this.signal = new XEFetchSignal()
}

Object.assign(XEFetchController.prototype, {
  // 中止请求
  abort: function () {
    var index = getIndex(this.signal)
    if (index !== undefined) {
      requestList[index][1].forEach(function (request) {
        setTimeout(function () {
          request.abort()
        })
      })
      requestList.splice(index, 1)
    }
  }
})

export default XEFetchController
