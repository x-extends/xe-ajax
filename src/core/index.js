import { isObject, objectAssign, clearXEAjaxContext } from '../core/utils'
import { XEAjax } from '../core/ajax'

function getOptions (method, def, options) {
  var opts = objectAssign({method: method, $context: XEAjax.$context, $Promise: XEAjax.$Promise}, def, options)
  clearXEAjaxContext(XEAjax)
  return opts
}

function responseResult (method) {
  return function () {
    return XEAjax(method.apply(this, arguments))
  }
}

// xhr response JSON
function responseJSON (method) {
  return function () {
    var opts = method.apply(this, arguments)
    var XEPromise = opts.$Promise || Promise
    return XEAjax(opts).then(function (response) {
      return new XEPromise(function (resolve, reject) {
        response.json().then(function (data) {
          (response.ok ? resolve : reject)(data)
        }).catch(function (e) {
          reject(null)
        })
      }, this)
    })
  }
}

export var ajax = XEAjax

// Http Request All
export function doAll (iterable) {
  var XEPromise = XEAjax.$Promise || Promise
  var context = XEAjax.$context
  clearXEAjaxContext(XEAjax)
  return XEPromise.all(iterable.map(function (item) {
    return isObject(item) ? XEAjax(objectAssign({$context: context, $Promise: XEPromise}, item)) : item
  }), context)
}

function createFetch (method) {
  return function (url, opts) {
    return getOptions(method, {url: url}, opts)
  }
}

function createParamsFetch (method, defs) {
  return function (url, params, opts) {
    return getOptions(method, objectAssign({url: url, params: params}, defs), opts)
  }
}

function createBodyFetch (method) {
  return function (url, body, opts) {
    return getOptions(method, {url: url, body: body}, opts)
  }
}

var requestHead = createFetch('HEAD')
var requestDelete = createFetch('DELETE')

var requestJsonp = createParamsFetch('GET', {jsonp: 'callback'})
var requestGet = createParamsFetch('GET')

var requestPost = createBodyFetch('POST')
var requestPut = createBodyFetch('PUT')
var requestPatch = createBodyFetch('PATCH')

export var fetchHead = responseResult(requestHead)
export var fetchDelete = responseResult(requestDelete)
export var fetchJsonp = responseResult(requestJsonp)
export var fetchGet = responseResult(requestGet)
export var fetchPost = responseResult(requestPost)
export var fetchPut = responseResult(requestPut)
export var fetchPatch = responseResult(requestPatch)

export var headJSON = responseJSON(requestHead)
export var deleteJSON = responseJSON(requestDelete)
export var jsonp = responseJSON(requestJsonp)
export var getJSON = responseJSON(requestGet)
export var postJSON = responseJSON(requestPost)
export var putJSON = responseJSON(requestPut)
export var patchJSON = responseJSON(requestPatch)
