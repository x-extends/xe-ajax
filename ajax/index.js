import XEAjax, { setup } from './constructor'
import { interceptors } from './interceptor'
import { cancelXHR } from './cancelXHR'
import { isObject } from './util'

function createAjax (method, def, options) {
  return XEAjax(Object.assign({method: method}, def, options))
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
export function doGet (url, params, opts) {
  return createAjax('GET', isObject(url) ? {} : {url: url, params: params}, opts)
}

// Http Request Method POST
export function doPost (url, body, opts) {
  return createAjax('POST', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method PUT
export function doPut (url, body, opts) {
  return createAjax('PUT', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method PATCH
export function doPatch (url, body, opts) {
  return createAjax('PATCH', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method DELETE
export function doDelete (url, body, opts) {
  return createAjax('DELETE', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method jsonp
export function jsonp (url, params, opts) {
  return createAjax('GET', {url: url, params: params, jsonp: 'callback'}, opts)
}

export var getJSON = responseJSON(doGet)
export var postJSON = responseJSON(doPost)
export var putJSON = responseJSON(doPut)
export var patchJSON = responseJSON(doPatch)
export var deleteJSON = responseJSON(doDelete)

export default {
  doAll: doAll,
  doGet: doGet,
  getJSON: getJSON,
  doPost: doPost,
  postJSON: postJSON,
  doPut: doPut,
  putJSON: putJSON,
  doPatch: doPatch,
  patchJSON: patchJSON,
  doDelete: doDelete,
  deleteJSON: deleteJSON,
  jsonp: jsonp,
  cancelXHR: cancelXHR,
  setup: setup,
  interceptors: interceptors
}
