import { XEAjax } from './ajax/constructor'

/**
 * 函数扩展
 *
 * @param {Object} methods 扩展函数对象
 */
export function mixin (methods) {
  if (methods) {
    Object.keys(methods).forEach(function (name) {
      var fn = methods[name]
      XEAjax[name] = typeof fn === 'function' ? function () {
        var rest = fn.apply(XEAjax.context || window, arguments)
        XEAjax.context = window
        return rest
      } : fn
    })
  }
}

export var constructor = XEAjax
export * from './ajax'
