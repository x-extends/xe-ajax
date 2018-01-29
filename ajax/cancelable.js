var requestList = []
var cmdIndex = 0

export function XEAjaxCancelable () {
  this._ID = 'XEAjax_' + (++cmdIndex)
}

function promiseHandle (status) {
  return function (resp) {
    var xhr = {status: status, response: resp || ''}
    if (resp && resp.response !== undefined && resp.status !== undefined) {
      xhr = resp
    }
    cancelHandle.call(this, xhr)
  }
}

function cancelHandle (xhr) {
  var index = getIndex(this)
  if (index !== undefined) {
    requestList[index][1].forEach(function (request) {
      setTimeout(function () {
        request.abort(xhr)
      })
    })
    requestList.splice(index, 1)
  }
}

Object.assign(XEAjaxCancelable.prototype, {
  cancel: cancelHandle,
  resolve: promiseHandle(200),
  reject: promiseHandle(500)
})

function getIndex (item) {
  for (var index = 0, len = requestList.length; index < len; index++) {
    if (item === requestList[index][0]) {
      return index
    }
  }
}

export function setCancelableItem (request) {
  var item = request.cancelable
  if (item && item.constructor === XEAjaxCancelable) {
    var index = getIndex(item)
    if (index === undefined) {
      requestList.push([item, [request]])
    } else {
      requestList[index][1].push(request)
    }
  }
}

export default XEAjaxCancelable
