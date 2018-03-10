import { XERequest } from '../entity/request'
import { objectAssign, getBaseURL } from '../core/utils'
import { fetchRequest } from '../adapters/fetch'
import { sendJSONP } from '../adapters/jsonp'

export var setupDefaults = {
  method: 'GET',
  baseURL: getBaseURL(),
  credentials: 'same-origin',
  bodyType: 'JSON_DATA',
  headers: {
    Accept: 'application/json, text/plain, */*;'
  },
  validateStatus: function (response) {
    return response.status >= 200 && response.status < 300
  }
}

/**
  * XHR AJAX
  *
  * @param Object options 请求参数
  * @return Promise
  */
export function XEAjax (options) {
  var opts = objectAssign({}, setupDefaults, {headers: objectAssign({}, setupDefaults.headers)}, options)
  var XEPromise = opts.$Promise || Promise
  return new XEPromise(function (resolve, reject) {
    return (opts.jsonp ? sendJSONP : fetchRequest)(new XERequest(opts), resolve, reject)
  }, opts.$context)
}

/**
 * Request 对象
 *
 * @param String url 请求地址
 * @param String baseURL 基础路径，默认上下文路径
 * @param String method 请求方法(默认GET)
 * @param Object params 请求参数，序列化后会拼接在url
 * @param Object body 提交参数
 * @param String bodyType 提交参数方式(默认JSON_DATA) 支持[JSON_DATA:以json data方式提交数据] [FORM_DATA:以form data方式提交数据]
 * @param String jsonp 调用jsonp服务,回调属性默认callback
 * @param String credentials 设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include(默认same-origin)
 * @param Number timeout 设置超时
 * @param Object headers 请求头
 * @param Function transformParams(params, request) 用于改变URL参数
 * @param Function paramsSerializer(params, request) 自定义URL序列化函数
 * @param Function transformBody(body, request) 用于改变提交数据
 * @param Function stringifyBody(body, request) 自定义转换提交数据的函数
 * @param Function validateStatus(response) 自定义 请求成功判断条件
 * @param Function $XMLHttpRequest 自定义 XMLHttpRequest 的函数
 * @param Function $fetch 自定义 fetch 的函数
 */
export var setup = function setup (options) {
  objectAssign(setupDefaults, options)
}
