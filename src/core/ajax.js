'use strict'

var utils = require('./utils')
var XEProgress = require('../handle/progress')
var XEHeaders = require('../handle/headers')
var XEAbortController = require('../handle/abortController')
var XERequest = require('../handle/request')
var XEResponse = require('../handle/response')
var fetchRequest = require('../adapters/fetch')
var sendJSONP = require('../adapters/jsonp')
var setupDefaults = require('./setup')
var handleExports = require('../handle')
var interceptorExports = require('../handle/interceptor')

var errorMessage = {
  ERR_A: 'The user aborted a request',
  ERR_F: 'Network request failed'
}

function handleDefaultHeader (request) {
  var reqHeaders = request.headers
  var reqBody = request.body
  var reqMethod = request.method
  if (reqBody && reqMethod !== 'GET' && reqMethod !== 'HEAD') {
    if (!utils.isFData(reqBody)) {
      reqHeaders.set('Content-Type', utils.isURLSParams(reqBody) || request.bodyType === 'form-data' ? 'application/x-www-form-urlencoded' : 'application/json; charset=utf-8')
    }
  }
  if (utils.isCrossOrigin(request.getUrl())) {
    reqHeaders.set('X-Requested-With', 'XMLHttpRequest')
  }
}

/**
  * 支持: nodejs、browser
  *
  * @param { Object} options
  * @return { Promise }
  */
function XEAjax (options) {
  var opts = utils.assign({}, setupDefaults, { headers: utils.assign({}, setupDefaults.headers) }, options)
  var request = new XERequest(opts)
  return new Promise(function (resolve, reject) {
    handleDefaultHeader(request)
    return interceptorExports.requests(request).then(function () {
      (request.jsonp ? sendJSONP : fetchRequest)(request, function (response) {
        interceptorExports.toResolves(request, handleExports.toResponse(response, request), resolve, reject)
      }, function (type) {
        interceptorExports.toRejects(request, utils.createErr(errorMessage[type || 'ERR_F']), resolve, reject)
      })
    })
  })
}

XEAjax.interceptors = interceptorExports.interceptors
XEAjax.serialize = utils.serialize
XEAjax.Progress = XEProgress
XEAjax.AbortController = XEAbortController
XEAjax.headers = XEHeaders
XEAjax.request = XERequest
XEAjax.response = XEResponse

/**
 * Installation
 */
XEAjax.use = function (plugin) {
  plugin.install(XEAjax)
}

/**
 * 参数说明
 *
 * 基础参数
 * @param { String } url 请求地址
 * @param { String } baseURL 基础路径，默认上下文路径
 * @param { String } method 请求方法(默认GET)
 * @param { Object } params 请求参数，序列化后会拼接在url
 * @param { Object } body 提交参数
 * @param { String } bodyType 提交参数方式可以设置json-data,form-data(json-data)
 * @param { String } jsonp 调用jsonp服务,回调属性默认callback
 * @param { Number } timeout 设置超时
 * @param { Object } headers 请求头
 * @param { Function } transformParams(params, request) 用于改变URL参数
 * @param { Function } paramsSerializer(params, request) 自定义URL序列化函数
 * @param { Function } transformBody(body, request) 用于改变提交数据
 * @param { Function } stringifyBody(body, request) 自定义转换提交数据的函数
 * @param { Function } validateStatus(response) 自定义校验请求是否成功
 * 只有在支持 fetch 的环境下才有效
 * @param { String } cache 处理缓存方式,可以设置default,no-store,no-cache,reload,force-cache,only-if-cached(默认default)
 * @param { String } credentials 设置 cookie 是否随请求一起发送,可以设置: omit,same-origin,include(默认same-origin)
 * @param { String } referrer 可以设置: no-referrer,client或URL(默认client)
 * @param { String } referrerPolicy 可以设置: no-referrer,no-referrer-when-downgrade,origin,origin-when-cross-origin,unsafe-url
 * @param { String } integrity 包括请求的subresource integrity值
 * 高级参数(不建议使用))
 * @param { Function } $XMLHttpRequest 自定义 XMLHttpRequest 请求函数
 * @param { Function } $http 自定义 http 请求函数
 * @param { Function } $fetch 自定义 fetch 请求函数
 * @param { Function } $jsonp 自定义 jsonp 处理函数
 * @param { Function } $options 自定义参数
 */
XEAjax.setup = function (options) {
  utils.assign(setupDefaults, options)
}

module.exports = XEAjax
