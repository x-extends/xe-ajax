import { isObject, serialize, objectAssign } from './util'
import XEAjax, { setup } from './constructor'
import { XEFetchController } from './fetchController'
import { interceptors } from './interceptor'

function createAjax (method, def, options) {
  return XEAjax(objectAssign({method: method}, def, options))
}

// xhr response JSON
function responseJSON (method) {
  return function () {
    return method.apply(this, arguments).then(function (response) {
      return new Promise(function (resolve, reject) {
        response.json().then(function (data) {
          (response.ok ? resolve : reject)(data)
        }).catch(function (data) {
          reject(data)
        })
      })
    })
  }
}

// Http Request
export var ajax = XEAjax

// Http Request All
export function doAll (iterable) {
  return Promise.all(iterable.map(function (item) {
    if (item instanceof Promise) {
      return item
    } else if (item && isObject(item)) {
      return ajax(item)
    }
    return item
  }))
}

// Http Request Method GET
export function fetchGet (url, params, opts) {
  return createAjax('GET', isObject(url) ? {} : {url: url, params: params}, opts)
}

// Http Request Method POST
export function fetchPost (url, body, opts) {
  return createAjax('POST', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method PUT
export function fetchPut (url, body, opts) {
  return createAjax('PUT', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method PATCH
export function fetchPatch (url, body, opts) {
  return createAjax('PATCH', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method DELETE
export function fetchDelete (url, body, opts) {
  return createAjax('DELETE', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method jsonp
export function jsonp (url, params, opts) {
  return createAjax('GET', {url: url, params: params, jsonp: 'callback'}, opts)
}

export var getJSON = responseJSON(fetchGet)
export var postJSON = responseJSON(fetchPost)
export var putJSON = responseJSON(fetchPut)
export var patchJSON = responseJSON(fetchPatch)
export var deleteJSON = responseJSON(fetchDelete)

export var AjaxController = XEFetchController
export var version = '3.0.7'

var ajaxMethods = {
  doAll: doAll,
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
