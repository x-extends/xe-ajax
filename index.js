import { serialize, objectEach, isFunction, clearXEAjaxContext, objectAssign } from './src/core/utils'
import { XEAjax, setup } from './src/core/ajax'
import { interceptors } from './src/handle/interceptor'
import { exportMethods } from './src/core/methods'
import { XEAbortController } from './src/handle/abort'

/**
 * functions of mixing
 *
 * @param {Object} methods
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
 * installation
 */
function use (plugin) {
  plugin.install(XEAjax)
}

objectAssign(XEAjax, {
  use: use,
  setup: setup,
  mixin: mixin,
  AbortController: XEAbortController,
  serialize: serialize,
  interceptors: interceptors,
  version: '3.3.1',
  $name: 'XEAjax'
})

mixin(exportMethods)

export * from './src/core'
export default XEAjax
