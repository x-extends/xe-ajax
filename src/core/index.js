'use strict'

var XEAjax = require('./ajax')
var utils = require('./utils')
var XEAbortController = require('../handle/abortController')
var interceptorExports = require('../handle/interceptor')

function getOptions (method, def, options) {
  var opts = utils.objectAssign({method: method, $context: XEAjax.$context, $Promise: XEAjax.$Promise}, def, options)
  utils.clearXEAjaxContext(XEAjax)
  return opts
}

function responseHeaders (response) {
  var result = {}
  response.headers.forEach(function (value, key) {
    result[key] = value
  })
  return result
}

// to fetch response
function requestToFetchResponse (method) {
  return function () {
    return XEAjax(method.apply(this, arguments))
  }
}

// to response
function requestToResponse (method) {
  return function () {
    var opts = method.apply(this, arguments)
    var XEPromise = opts.$Promise || Promise
    return XEAjax(opts).then(function (response) {
      return new XEPromise(function (resolve, reject) {
        var finish = response.ok ? resolve : reject
        response.clone().json().catch(function (e) {
          return response.clone().text()
        }).then(function (data) {
          finish({
            data: data,
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders(response)
          })
        })
      }, this)
    })
  }
}

// to json
function requestToJSON (method) {
  return function () {
    return method.apply(this, arguments).then(function (response) {
      return response.data
    }).catch(function (response) {
      return response.data
    })
  }
}

// Promise.all
function doAll (iterable) {
  var XEPromise = XEAjax.$Promise || Promise
  var context = XEAjax.$context
  utils.clearXEAjaxContext(XEAjax)
  return XEPromise.all(iterable.map(function (item) {
    if (item instanceof XEPromise || item instanceof Promise) {
      return item
    }
    return utils.isObject(item) ? XEAjax(utils.objectAssign({$context: context, $Promise: XEPromise}, item)) : item
  }), context)
}

function createFetch (method) {
  return function (url, opts) {
    return getOptions(method, {url: url}, opts)
  }
}

function createParamsFetch (method, defs) {
  return function (url, params, opts) {
    return getOptions(method, utils.objectAssign({url: url, params: params}, defs), opts)
  }
}

function createBodyFetch (method) {
  return function (url, body, opts) {
    return getOptions(method, {url: url, body: body}, opts)
  }
}

function ajaxFetch (url, options) {
  return fetchGet(url, null, options)
}

var requestHead = createFetch('HEAD')
var requestDelete = createFetch('DELETE')
var requestJsonp = createParamsFetch('GET', {jsonp: 'callback'})
var requestGet = createParamsFetch('GET')
var requestPost = createBodyFetch('POST')
var requestPut = createBodyFetch('PUT')
var requestPatch = createBodyFetch('PATCH')

var fetchHead = requestToFetchResponse(requestHead)
var fetchDelete = requestToFetchResponse(requestDelete)
var fetchJsonp = requestToFetchResponse(requestJsonp)
var fetchGet = requestToFetchResponse(requestGet)
var fetchPost = requestToFetchResponse(requestPost)
var fetchPut = requestToFetchResponse(requestPut)
var fetchPatch = requestToFetchResponse(requestPatch)

var doGet = requestToResponse(requestGet)
var doPost = requestToResponse(requestPost)
var doPut = requestToResponse(requestPut)
var doDelete = requestToResponse(requestDelete)
var doPatch = requestToResponse(requestPatch)
var doHead = requestToResponse(requestHead)
var doJsonp = requestToResponse(requestJsonp)

var ajaxExports = {
  doAll: doAll,
  ajax: XEAjax,

  fetch: ajaxFetch,
  fetchGet: fetchGet,
  fetchPost: fetchPost,
  fetchPut: fetchPut,
  fetchDelete: fetchDelete,
  fetchPatch: fetchPatch,
  fetchHead: fetchHead,
  fetchJsonp: fetchJsonp,

  doGet: doGet,
  doPost: doPost,
  doPut: doPut,
  doDelete: doDelete,
  doPatch: doPatch,
  doHead: doHead,
  doJsonp: doJsonp,

  getJSON: requestToJSON(doGet),
  postJSON: requestToJSON(doPost),
  putJSON: requestToJSON(doPut),
  deleteJSON: requestToJSON(doDelete),
  patchJSON: requestToJSON(doPatch),
  headJSON: requestToJSON(doHead),
  jsonp: requestToJSON(doJsonp)
}

/**
 * functions of mixing
 *
 * @param {Object} methods
 */
XEAjax.mixin = function (methods) {
  utils.objectEach(methods, function (fn, name) {
    XEAjax[name] = utils.isFunction(fn) ? function () {
      var result = fn.apply(XEAjax.$context, arguments)
      utils.clearXEAjaxContext(XEAjax)
      return result
    } : fn
  })
}

utils.objectAssign(XEAjax, {
  serialize: utils.serialize,
  interceptors: interceptorExports.interceptors,
  AbortController: XEAbortController
})

XEAjax.mixin(ajaxExports)

module.exports = XEAjax
module.exports.default = XEAjax
