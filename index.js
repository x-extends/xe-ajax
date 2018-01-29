import XEAjax from './ajax/constructor'
import ajax from './ajax'

/**
 * 函数扩展
 *
 * @param {Object} methods 扩展函数对象
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

var s = ''
for (var key in ajax) {
  s += key + ': ' + key + ', '
}
console.log(s)

mixin(ajax)
XEAjax.use = use
XEAjax.mixin = mixin

export * from './ajax'
export default XEAjax
