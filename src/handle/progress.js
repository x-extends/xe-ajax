'use strict'

var utils = require('../core/utils')

/**
 * 进度条
 *
 * @param {Object} options 参数
 */
function XEProgress (options) {
  Object.assign(this, {
    autoCompute: true,
    fixed: 2,
    meanSpeed: 0,
    onDownloadProgress: null,
    onUploadProgress: null
  }, options, { _progress: { value: 0, total: 0, loaded: 0 } })
}

if (utils.IS_DP) {
  utils.arrayEach('time,speed,loaded,value,total,remaining'.split(','), function (name) {
    Object.defineProperty(XEProgress.prototype, name, {
      get: function () {
        return this._progress[name]
      }
    })
  })
}

module.exports = XEProgress
