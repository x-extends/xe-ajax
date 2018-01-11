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

mixin(ajax)
XEAjax.mixin = mixin

export * from './ajax'
export default XEAjax
