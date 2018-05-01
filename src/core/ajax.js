'use strict'

var utils = require('./utils')
var XEAbortController = require('../handle/abortController')
var XERequest = require('../handle/request')
var fetchRequest = require('../adapters/fetch')
var sendJSONP = require('../adapters/jsonp')
var setupDefaults = require('./setup')
var handleExports = require('../handle')
var interceptorExports = require('../handle/interceptor')

var errorType = {
  aborted: 'The user aborted a request.',
  timeout: 'Request timeout.',
  failed: 'Network request failed.'
}

/**
  * 支持: nodejs和浏览器 fetch
  *
  * @param { Object} options
  * @return { Promise }
  */
function XEAjax (options) {
  var opts = utils.objectAssign({}, setupDefaults, {headers: utils.objectAssign({}, setupDefaults.headers)}, options)
  var request = new XERequest(opts)
  var XEPromise = request.$Promise || Promise
  return new XEPromise(function (resolve, reject) {
    return interceptorExports.requests(request).then(function () {
      (request.jsonp ? sendJSONP : fetchRequest)(request, function (response) {
        interceptorExports.responseResolves(request, handleExports.toResponse(response, request), resolve, reject)
      }, function (type) {
        interceptorExports.responseRejects(request, new TypeError(errorType[type || 'failed']), resolve, reject)
      })
    })
  }, request.$context)
}

XEAjax.version = '3.4.1'
XEAjax.interceptors = interceptorExports.interceptors
XEAjax.serialize = utils.serialize
XEAjax.AbortController = XEAbortController

/**
 * installation
 */
XEAjax.use = function (plugin) {
  plugin.install(XEAjax)
}

/**
 * options
 *
 * 基础参数
 * @param { String } url 请求地址
 * @param { String } baseURL 基础路径，默认上下文路径
 * @param { String } method 请求方法(默认GET)
 * @param { Object } params 请求参数，序列化后会拼接在url
 * @param { Object } body 提交参数
 * @param { String } bodyType 提交参数方式可以设置json-data,form-data(json-data)
 * @param { String } jsonp 调用jsonp服务,回调属性默认callback
 * @param { String } cache 处理缓存方式,可以设置default,no-store,no-cache,reload,force-cache,only-if-cached(默认default)
 * @param { String } credentials 设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include(默认same-origin)
 * @param { Number } timeout 设置超时
 * @param { Object } headers 请求头
 * @param { Function } transformParams(params, request) 用于改变URL参数
 * @param { Function } paramsSerializer(params, request) 自定义URL序列化函数
 * @param { Function } transformBody(body, request) 用于改变提交数据
 * @param { Function } stringifyBody(body, request) 自定义转换提交数据的函数
 * @param { Function } validateStatus(response) 自定义校验请求是否成功
 * 高级参数
 * @param { Function } $XMLHttpRequest 自定义 XMLHttpRequest 请求函数
 * @param { Function } $http 自定义 http 请求函数
 * @param { Function } $fetch 自定义 fetch 请求函数
 * @param { Function } $jsonp 自定义 jsonp 处理函数
 * @param { Function } $Promise 自定义 Promise 函数
 * @param { Function } $context 自定义上下文
 * @param { Function } $options 自定义参数
 */
XEAjax.setup = function (options) {
  utils.objectAssign(setupDefaults, options)
}

module.exports = XEAjax
