'use strict'

var XEAjax = require('./ajax')
var utils = require('./utils')

function getOptions (method, def, options) {
  var opts = utils.assign({ method: method }, def, options)
  return opts
}

function responseHeaders (response) {
  var result = {}
  utils.headersEach(response.headers, function (value, key) {
    result[key] = value
  })
  return result
}

// To fetch Response
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
    return XEAjax(opts)['catch'](function (e) {
      return Promise.reject(getResponseSchema(isRespSchema, '', 'failed', e.message || e, {}), this)
    }).then(function (response) {
      return new Promise(function (resolve, reject) {
        var finish = response.ok ? resolve : reject
        response.text().then(function (data) {
          try {
            return JSON.parse(data)
          } catch (e) {
            return data
          }
        })['catch'](function (e) {
          return ''
        }).then(function (data) {
          finish(getResponseSchema(isRespSchema, data, response.status, response.statusText, responseHeaders(response)))
        })
      }, this)
    })
  }
}

// To Response
function requestToResponse (method) {
  return createResponseSchema(method, true)
}

// To JSON
function requestToJSON (method) {
  return createResponseSchema(method)
}

// 和 Promise.all 类似，支持传对象参数
function doAll (iterable) {
  return Promise.all(iterable.map(function (item) {
    if (item instanceof Promise) {
      return item
    }
    return utils.isObj(item) ? XEAjax(item) : item
  }))
}

function createFetch (method) {
  return function (url, opts) {
    return getOptions(method, { url: url }, opts)
  }
}

function createParamsFetch (method, defs) {
  return function (url, params, opts) {
    return getOptions(method, utils.assign({ url: url, params: params }, defs), opts)
  }
}

function createBodyFetch (method) {
  return function (url, body, opts) {
    return getOptions(method, { url: url, body: body }, opts)
  }
}

var requestHead = createFetch('HEAD')
var requestDelete = createFetch('DELETE')
var requestJsonp = createParamsFetch('GET', { jsonp: 'callback' })
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

  get: requestToJSON(requestGet),
  post: requestToJSON(requestPost),
  put: requestToJSON(requestPut),
  delete: requestToJSON(requestDelete),
  patch: requestToJSON(requestPatch),
  head: requestToJSON(requestHead),
  jsonp: requestToJSON(requestJsonp)
}

/**
 * 混合函数
 *
 * @param {Object} methods
 */
XEAjax.mixin = function (methods) {
  utils.objectEach(methods, function (fn, name) {
    XEAjax[name] = utils.isFn(fn) ? function () {
      var result = fn.apply(XEAjax.$context, arguments)
      XEAjax.$context = null
      return result
    } : fn
  })
}

utils.assign(XEAjax, ajaxExports)

module.exports = XEAjax
module.exports.default = XEAjax
