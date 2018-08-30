'use strict'

var utils = require('../core/utils')

function XEProgress (options) {
  Object.assign(this, {
    fixed: 2,
    onDownloadProgress: null,
    onUploadProgress: null
  }, options, {_progress: {}})
}

if (utils.IS_DEF) {
  utils.arrayEach('time,speed,loaded,value,total,remaining'.split(','), function (name) {
    Object.defineProperty(XEProgress.prototype, name, {
      get: function () {
        return this._progress[name]
      }
    })
  })
}

module.exports = XEProgress
