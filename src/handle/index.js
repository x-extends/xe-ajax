
'use strict'

var utils = require('../core/utils')
var XEResponse = require('./response')

var handleExports = {
  // result to Response
  toResponse: function (resp, request) {
    if ((typeof Response === 'function' && resp.constructor === Response) || resp.constructor === XEResponse) {
      return resp
    }
    var options = {status: resp.status, statusText: resp.statusText, headers: resp.headers}
    if (utils.isSupportAdvanced()) {
      return new XEResponse(resp.body instanceof Blob ? resp.body : new Blob([utils.isString(resp.body) ? resp.body : JSON.stringify(resp.body)]), options, request)
    }
    return new XEResponse(utils.isString(resp.body) ? resp.body : JSON.stringify(resp.body), options, request)
  }
}

module.exports = handleExports
