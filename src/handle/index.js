
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

function getStringifyBody (reqBody) {
  return utils.isStr(reqBody) ? reqBody : JSON.stringify(reqBody)
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
    if (utils.IS_A) {
      reqBody = reqBody instanceof Blob ? reqBody : new Blob([getStringifyBody(reqBody)])
    } else {
      reqBody = getStringifyBody(reqBody)
    }
    return new XEResponse(reqBody, options, request)
  }
}

module.exports = handleExports
