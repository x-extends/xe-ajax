import { isObject, objectAssign, clearXEAjaxContext, arrayEach } from '../core/utils'
import { XEAjax } from '../core/ajax'

function getOptions (method, def, options) {
  var opts = objectAssign({method: method, $context: XEAjax.$context, $Promise: XEAjax.$Promise}, def, options)
  clearXEAjaxContext(XEAjax)
  return opts
}

function responseResult (method) {
  return function () {
    return ajax(method.apply(this, arguments))
  }
}

// xhr response JSON
function responseJSON (method) {
  return function () {
    var opts = method.apply(this, arguments)
    var XEPromise = opts.$Promise || Promise
    return ajax(opts).then(function (response) {
      return new XEPromise(function (resolve, reject) {
        response.json().then(function (data) {
          (response.ok ? resolve : reject)(data)
        }).catch(function (data) {
          reject(data)
        })
      }, this)
    })
  }
}

// Http Request
export var ajax = XEAjax

// Http Request All
export function doAll (iterable) {
  var XEPromise = XEAjax.$Promise || Promise
  var context = XEAjax.$context
  clearXEAjaxContext(XEAjax)
  return XEPromise.all(iterable.map(function (item) {
    if (item instanceof XEPromise) {
      return item
    } else if (item && isObject(item)) {
      return ajax(objectAssign({$context: context, $Promise: XEPromise}, item))
    }
    return item
  }), context)
}

function requestFn (method, defs) {
  return function (url, params, opts) {
    return getOptions(method, isObject(url) ? url : objectAssign({url: url, params: params}, defs), opts)
  }
}

var requests = {
  HEAD: requestFn('HEAD'),
  GET: requestFn('GET'),
  JSONP: requestFn('GET', {jsonp: 'callback'})
}
arrayEach(['POST', 'PUT', 'DELETE', 'PATCH'], function (method) {
  requests[method] = function (url, body, opts) {
    return getOptions(method, isObject(url) ? url : {url: url, body: body}, opts)
  }
})

export var fetchHead = responseResult(requests.HEAD)
export var fetchGet = responseResult(requests.GET)
export var fetchPost = responseResult(requests.POST)
export var fetchPut = responseResult(requests.PUT)
export var fetchDelete = responseResult(requests.DELETE)
export var fetchPatch = responseResult(requests.PATCH)
export var fetchJsonp = responseResult(requests.JSONP)

export var headJSON = responseJSON(requests.HEAD)
export var getJSON = responseJSON(requests.GET)
export var postJSON = responseJSON(requests.POST)
export var putJSON = responseJSON(requests.PUT)
export var deleteJSON = responseJSON(requests.DELETE)
export var patchJSON = responseJSON(requests.PATCH)
export var jsonp = responseJSON(requests.JSONP)
