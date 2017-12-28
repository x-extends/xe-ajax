import { XEAjax } from './ajax/constructor'
import ajax from './ajax'

XEAjax.mixin(ajax)

export default Object.assign({ajax: XEAjax, mixin: XEAjax.mixin}, ajax)
