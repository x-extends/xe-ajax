'use strict'

function XEAbortSignalPolyfill () {
  this.onaborted = null
  this._abortSignal = {aborted: false}
}

Object.defineProperty(XEAbortSignalPolyfill.prototype, 'aborted', {
  get: function () {
    return this._abortSignal.aborted
  }
})

module.exports = XEAbortSignalPolyfill
