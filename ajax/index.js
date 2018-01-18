import XEAjax from './constructor'
import { isObject } from './util'

function createAjax (method, def, opts) {
  return XEAjax(Object.assign({method: method}, def, opts))
}

// xhr response JSON
function responseJSON (method) {
  return function () {
    return method.apply(this, arguments).then(function (response) {
      return response.body
    }).catch(function (response) {
      return Promise.reject(response.body, this)
    })
  }
}

// Http Request
export var ajax = XEAjax

// Http Request Method get
export function doGet (url, params, opts) {
  return createAjax('get', isObject(url) ? {} : {url: url, params: params}, opts)
}

// Http Request Method post
export function doPost (url, body, opts) {
  return createAjax('post', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method put
export function doPut (url, body, opts) {
  return createAjax('put', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method patch
export function doPatch (url, body, opts) {
  return createAjax('patch', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method delete
export function doDelete (url, body, opts) {
  return createAjax('delete', isObject(url) ? {} : {url: url, body: body}, opts)
}

// Http Request Method jsonp
var jsonpIndex = 0
export function jsonp (url, params, opts) {
  return createAjax('get', {url: url, params: params, jsonp: 'callback', jsonpCallback: 'XEAjax_JSONP_' + (++jsonpIndex)}, opts)
}

export var getJSON = responseJSON(doGet)
export var postJSON = responseJSON(doPost)
export var putJSON = responseJSON(doPut)
export var patchJSON = responseJSON(doPatch)
export var deleteJSON = responseJSON(doDelete)

export default {
  doAll: Promise.all,
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
  jsonp: jsonp
}
