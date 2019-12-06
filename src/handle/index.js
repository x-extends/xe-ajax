
'use strict'

var utils = require('../core/utils')
var XEResponse = require('./response')

function isNativeResponse (obj) {
  return obj && typeof Response !== 'undefined' && obj.constructor === Response
}

function isResponse (obj) {
  return obj && obj.constructor === XEResponse
}

function getStringifyBody (reqBody) {
  return utils.isStr(reqBody) ? reqBody : JSON.stringify(reqBody)
}

function getResponse (reqBody, resp, request) {
  var options = { status: resp.status, statusText: resp.statusText, headers: resp.headers }
  if (utils.IS_A) {
    reqBody = reqBody instanceof Blob ? reqBody : new Blob([getStringifyBody(reqBody)])
  } else {
    reqBody = getStringifyBody(reqBody)
  }
  return new XEResponse(reqBody, options, request)
}

// 将请求结果转为 Respone 对象
function toResponse (resp, request) {
  if (isNativeResponse(resp)) {
    return request.validateStatus ? resp.text().then(function (text) {
      return getResponse(text, resp, request)
    }) : Promise.resolve(resp)
  }
  return Promise.resolve(isResponse(resp) ? resp : getResponse(resp.body, resp, request))
}

var handleExports = {
  getResponse: getResponse,
  isResponse: isResponse,
  toResponse: toResponse
}

module.exports = handleExports
