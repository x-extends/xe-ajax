import { objectEach, isFunction, clearXEAjaxContext } from './src/util'
import XEAjax from './src/constructor'
import ajaxMethods from './src'

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
}

mixin(ajaxMethods)
XEAjax.use = use
XEAjax.mixin = mixin

export * from './src'
export default XEAjax
