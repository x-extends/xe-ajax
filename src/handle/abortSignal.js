'use strict'

var utils = require('../core/utils')

function XEAbortSignal () {
  this.onaborted = null
  if (utils.IS_DP) {
    this._store = { aborted: false }
  } else {
    this.aborted = false
  }
}

if (utils.IS_DP) {
  Object.defineProperty(XEAbortSignal.prototype, 'aborted', {
    get: function () {
      return this._store.aborted
    }
  })
}

module.exports = XEAbortSignal
