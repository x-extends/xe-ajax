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
export function setRequest (request) {
  if (request.cancelToken) {
    var index = getIndex(request.cancelToken)
    if (index === undefined) {
      requestList.push([request.cancelToken, [request]])
    } else {
      requestList[index][1].push(request)
    }
  }
}

/**
 * 根据 cancelToken 中断 XHR 请求
 *
 * @param { String } cancelToken 名字
 */
export function cancelXHR (cancelToken) {
  var index = getIndex(cancelToken)
  if (index !== undefined) {
    requestList[index][1].forEach(function (request) {
      setTimeout(function () {
        request.abort()
      })
    })
    requestList.splice(index, 1)
  }
}

export default cancelXHR
