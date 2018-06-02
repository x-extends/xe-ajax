
'use strict'

var utils = require('../core/utils')
var XEResponse = require('./response')

function isResponse (obj) {
  if (obj) {
    var objConstructor = obj.constructor
    return (typeof Response !== 'undefined' && objConstructor === Response) || objConstructor === XEResponse
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
    var reqBody = resp.body
    var options = {status: resp.status, statusText: resp.statusText, headers: resp.headers}
    if (utils._A) {
      return new XEResponse(reqBody instanceof Blob ? reqBody : new Blob([utils.isString(reqBody) ? reqBody : JSON.stringify(reqBody)]), options, request)
    }
    return new XEResponse(utils.isString(reqBody) ? reqBody : JSON.stringify(reqBody), options, request)
  }
}

module.exports = handleExports
