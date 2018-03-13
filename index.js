import { serialize, objectEach, isFunction, clearXEAjaxContext, objectAssign } from './src/core/utils'
import { XEAbortController } from './src/entity/abort'
import { XEAjax, setupDefaults, setup } from './src/core/ajax'
import { interceptors } from './src/entity/interceptor'
import { exportMethods } from './src/core/methods'

export var AbortController = XEAbortController

/**
 * 混合函数
 *
 * @param {Object} methods 扩展
 */
function mixin (methods) {
  objectEach(methods, function (fn, name) {
    XEAjax[name] = isFunction(fn) ? function () {
      var result = fn.apply(XEAjax.$context, arguments)
      clearXEAjaxContext(XEAjax)
      return result
    } : fn
  })
}

/**
 * 安装插件
 */
function use (plugin) {
  plugin.install(XEAjax)
  if (setupDefaults.log) {
    console.info('[' + XEAjax.$name + '] Ready. Detected ' + plugin.$name + ' v' + plugin.version)
  }
}

objectAssign(XEAjax, {
  use: use,
  setup: setup,
  mixin: mixin,
  AbortController: AbortController,
  serialize: serialize,
  interceptors: interceptors,
  version: '3.2.3',
  $name: 'XEAjax'
})

mixin(exportMethods)

export * from './src/core'
export default XEAjax
