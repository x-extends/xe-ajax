
'use strict'

var utils = require('../core/utils')
var XEResponse = require('./response')

function isResponse (obj) {
  if (obj) {
    return (typeof Response !== 'undefined' && obj.constructor === Response) || obj.constructor === XEResponse
  }
  return false
}

var handleExports = {
  isResponse: isResponse,
  // result to Response
  toResponse: function (resp, request) {
    if (isResponse(resp)) {
      return resp
    }
    var options = {status: resp.status, statusText: resp.statusText, headers: resp.headers}
    if (utils._A) {
      return new XEResponse(resp.body instanceof Blob ? resp.body : new Blob([utils.isString(resp.body) ? resp.body : JSON.stringify(resp.body)]), options, request)
    }
    return new XEResponse(utils.isString(resp.body) ? resp.body : JSON.stringify(resp.body), options, request)
  }
}

module.exports = handleExports
