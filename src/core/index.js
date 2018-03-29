import { isObject, objectAssign, clearXEAjaxContext } from '../core/utils'
import { XEAjax } from '../core/ajax'

function getOptions (method, def, options) {
  var opts = objectAssign({method: method, $context: XEAjax.$context, $Promise: XEAjax.$Promise}, def, options)
  clearXEAjaxContext(XEAjax)
  return opts
}

// to response
function requestToResponse (method) {
  return function () {
    return XEAjax(method.apply(this, arguments))
  }
}

// to json
function requestToJSON (method) {
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

// Promise.all
export function doAll (iterable) {
  var XEPromise = XEAjax.$Promise || Promise
  var context = XEAjax.$context
  clearXEAjaxContext(XEAjax)
  return XEPromise.all(iterable.map(function (item) {
    if (item instanceof XEPromise || item instanceof Promise) {
      return item
    }
    return isObject(item) ? ajax(objectAssign({$context: context, $Promise: XEPromise}, item)) : item
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

export var fetchHead = requestToResponse(requestHead)
export var fetchDelete = requestToResponse(requestDelete)
export var fetchJsonp = requestToResponse(requestJsonp)
export var fetchGet = requestToResponse(requestGet)
export var fetchPost = requestToResponse(requestPost)
export var fetchPut = requestToResponse(requestPut)
export var fetchPatch = requestToResponse(requestPatch)

export var headJSON = requestToJSON(requestHead)
export var deleteJSON = requestToJSON(requestDelete)
export var jsonp = requestToJSON(requestJsonp)
export var getJSON = requestToJSON(requestGet)
export var postJSON = requestToJSON(requestPost)
export var putJSON = requestToJSON(requestPut)
export var patchJSON = requestToJSON(requestPatch)
