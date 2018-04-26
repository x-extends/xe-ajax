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

/* eslint-disable no-undef */
module.exports = XEAbortSignalPolyfill
