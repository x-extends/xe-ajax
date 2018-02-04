import { objectAssign } from './src/util'
import XEAjax from './src/constructor'
import ajaxMethods from './src'

/**
 * 混合函数
 *
 * @param {Object} methods 扩展
 */
function mixin (methods) {
  return objectAssign(XEAjax, methods)
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
