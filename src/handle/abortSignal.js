'use strict'

var utils = require('../core/utils')

function XEAbortSignalPolyfill () {
  this.onaborted = null
  if (utils.IS_DP) {
    this._store = { aborted: false }
  } else {
    this.aborted = false
  }
}

if (utils.IS_DP) {
  Object.defineProperty(XEAbortSignalPolyfill.prototype, 'aborted', {
    get: function () {
      return this._store.aborted
    }
  })
}

module.exports = XEAbortSignalPolyfill
