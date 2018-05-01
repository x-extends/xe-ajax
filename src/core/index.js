'use strict'

var XEAjax = require('./ajax')
var utils = require('./utils')

function getOptions (method, def, options) {
  var opts = utils.objectAssign({method: method, $context: XEAjax.$context, $Promise: XEAjax.$Promise}, def, options)
  utils.clearContext(XEAjax)
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

function getResponseSchema (isRespSchema, data, status, statusText, headers) {
  return isRespSchema ? {
    data: data,
    status: status,
    statusText: statusText,
    headers: headers
  } : data
}

function createResponseSchema (method, isRespSchema) {
  return function () {
    var opts = method.apply(this, arguments)
    var XEPromise = opts.$Promise || Promise
    return XEAjax(opts).catch(function (e) {
      return XEPromise.reject(getResponseSchema(isRespSchema, null, 'failed', e.message || e, {}), this)
    }).then(function (response) {
      return new XEPromise(function (resolve, reject) {
        var finish = response.ok ? resolve : reject
        response.clone().json().catch(function (e) {
          return response.clone().text()
        }).then(function (data) {
          finish(getResponseSchema(isRespSchema, data, response.status, response.statusText, responseHeaders(response)))
        })
      }, this)
    })
  }
}

// to response
function requestToResponse (method) {
  return createResponseSchema(method, true)
}

// to json
function requestToJSON (method) {
  return createResponseSchema(method)
}

// Promise.all
function doAll (iterable) {
  var XEPromise = XEAjax.$Promise || Promise
  var context = XEAjax.$context
  utils.clearContext(XEAjax)
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

var requestHead = createFetch('HEAD')
var requestDelete = createFetch('DELETE')
var requestJsonp = createParamsFetch('GET', {jsonp: 'callback'})
var requestGet = createParamsFetch('GET')
var requestPost = createBodyFetch('POST')
var requestPut = createBodyFetch('PUT')
var requestPatch = createBodyFetch('PATCH')

var ajaxExports = {
  doAll: doAll,
  ajax: XEAjax,

  fetch: requestToFetchResponse(createFetch('GET')),
  fetchGet: requestToFetchResponse(requestGet),
  fetchPost: requestToFetchResponse(requestPost),
  fetchPut: requestToFetchResponse(requestPut),
  fetchDelete: requestToFetchResponse(requestDelete),
  fetchPatch: requestToFetchResponse(requestPatch),
  fetchHead: requestToFetchResponse(requestHead),
  fetchJsonp: requestToFetchResponse(requestJsonp),

  doGet: requestToResponse(requestGet),
  doPost: requestToResponse(requestPost),
  doPut: requestToResponse(requestPut),
  doDelete: requestToResponse(requestDelete),
  doPatch: requestToResponse(requestPatch),
  doHead: requestToResponse(requestHead),
  doJsonp: requestToResponse(requestJsonp),

  getJSON: requestToJSON(requestGet),
  postJSON: requestToJSON(requestPost),
  putJSON: requestToJSON(requestPut),
  deleteJSON: requestToJSON(requestDelete),
  patchJSON: requestToJSON(requestPatch),
  headJSON: requestToJSON(requestHead),
  jsonp: requestToJSON(requestJsonp)
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
      utils.clearContext(XEAjax)
      return result
    } : fn
  })
}

XEAjax.mixin(ajaxExports)

module.exports = XEAjax
module.exports.default = XEAjax
