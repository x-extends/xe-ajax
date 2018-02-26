import { isObject, serialize, objectAssign, clearXEAjaxContext } from './util'
import XEAjax, { setup } from './constructor'
import { XEFetchController } from './fetchController'
import { interceptors } from './interceptor'

function getOptions (method, def, options) {
  var opts = objectAssign({method: method, $context: XEAjax.$context, $Promise: XEAjax.$Promise || Promise}, def, options)
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
    var XEPromise = opts.$Promise
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

// Http Request Method GET
function doGet (url, params, opts) {
  return getOptions('GET', isObject(url) ? {} : {url: url, params: params}, opts)
}

// Http Request Method POST
function doPost (url, body, opts) {
  return getOptions('POST', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method PUT
function doPut (url, body, opts) {
  return getOptions('PUT', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method PATCH
function doPatch (url, body, opts) {
  return getOptions('PATCH', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method DELETE
function doDelete (url, body, opts) {
  return getOptions('DELETE', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method jsonp
export function jsonp (url, params, opts) {
  return XEAjax(getOptions('GET', {url: url, params: params, jsonp: 'callback'}, opts))
}

export var fetchGet = responseResult(doGet)
export var fetchPost = responseResult(doPost)
export var fetchPut = responseResult(doPut)
export var fetchPatch = responseResult(doPatch)
export var fetchDelete = responseResult(doDelete)
export var getJSON = responseJSON(doGet)
export var postJSON = responseJSON(doPost)
export var putJSON = responseJSON(doPut)
export var patchJSON = responseJSON(doPatch)
export var deleteJSON = responseJSON(doDelete)

export var AjaxController = XEFetchController
export var version = '3.1.1'

var ajaxMethods = {
  doAll: doAll,
  ajax: ajax,
  fetchGet: fetchGet,
  getJSON: getJSON,
  fetchPost: fetchPost,
  postJSON: postJSON,
  fetchPut: fetchPut,
  putJSON: putJSON,
  fetchPatch: fetchPatch,
  patchJSON: patchJSON,
  fetchDelete: fetchDelete,
  deleteJSON: deleteJSON,
  jsonp: jsonp,
  setup: setup,
  serialize: serialize,
  interceptors: interceptors,
  AjaxController: AjaxController,
  version: version
}

export default ajaxMethods
