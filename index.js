import XEAjax from './ajax/constructor'
import ajax from './ajax'

/**
 * 混合函数
 *
 * @param {Object} methods 扩展
 */
function mixin (methods) {
  return Object.assign(XEAjax, methods)
}

/**
 * 安装插件
 */
function use (plugin) {
  plugin.install(XEAjax)
}

mixin(ajax)
XEAjax.use = use
XEAjax.mixin = mixin

export * from './ajax'
export default XEAjax
