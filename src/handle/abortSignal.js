'use strict'

var utils = require('../core/utils')

function XEAbortSignalPolyfill () {
  this.onaborted = null
  if (utils.IS_DP) {
    this.D_AS = { aborted: false }
  } else {
    this.aborted = false
  }
}

if (utils.IS_DP) {
  Object.defineProperty(XEAbortSignalPolyfill.prototype, 'aborted', {
    get: function () {
      return this.D_AS.aborted
    }
  })
}

module.exports = XEAbortSignalPolyfill
