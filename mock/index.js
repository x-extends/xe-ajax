import XEAjax from '../ajax/constructor'
import { isArray, isFunction, random } from '../ajax/util'

var defineMockServices = []
var setupDefaults = {
  baseURL: location.origin,
  timeout: '10-200'
}

function XEMockService (url, method, response, options) {
  if (url && method) {
    this.url = url
    this.method = method
    this.response = response
    this.options = options
    this.key = getMockKey(url, method)
  } else {
    throw new TypeError('url and method cannot be empty')
  }
}

Object.assign(XEMockService.prototype, {
  getTemplate: function (request, time) {
    var response = this.response
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (isFunction(response)) {
          response(resolve, reject, request)
        } else {
          resolve(response)
        }
      }, time)
    })
  },
  sendResponse: function (request, next) {
    var time = getTime(this.options.timeout)
    var mockLog = 'XEAjaxMock: ' + this.key + ' ' + time + 'ms'
    return this.getTemplate(request, time).then(function (response) {
      return {status: 200, response: response}
    }).catch(function (response) {
      return {status: 0, response: response}
    }).then(function (xhr) {
      next(xhr)
      console.info(mockLog)
    })
  }
})

function getTime (timeout) {
  var matchs = timeout.match(/(\d+)-(\d+)/)
  return matchs.length === 3 ? random(parseInt(matchs[1]), parseInt(matchs[2])) : 0
}

function getMockKey (url, method) {
  return method.toLocaleUpperCase() + '@' + url.split(/\?|#/)[0]
}

function mateMockItem (request) {
  var mockKey = getMockKey(request.getUrl() || '', request.method)
  return defineMockServices.find(function (item) {
    return item.key === mockKey
  })
}

function defineMocks (list, options, baseURL) {
  if (isArray(list)) {
    list.forEach(function (item) {
      if (item.url) {
        if (!baseURL) {
          baseURL = /\w+:\/{2}.*/.test(item.url) ? '' : options.baseURL
        }
        item.url = (baseURL ? baseURL.replace(/\/$/, '') + '/' : '') + item.url.replace(/^\//, '')
        if (item.response) {
          item.method = String(item.method || 'get')
          defineMockServices.push(new XEMockService(item.url, item.method, item.response, options))
        }
        defineMocks(item.children, options, item.url)
      }
    })
  }
}

/**
 * 设置全局参数
 *
 * @param Object options 参数
 */
export function setup (options) {
  Object.assign(setupDefaults, options)
}

/**
  * XEMock 虚拟服务
  *
  * @param Array/String url 路径数组/请求路径
  * @param String method 请求方法
  * @param Object/Function response 数据或返回数据方法
  * @param Object options 参数
  */
export function mock (url, method, response, options) {
  defineMocks(isArray(url) ? (options = method, url) : [{url: url, method: method, response: response}], Object.assign({}, setupDefaults, options))
}

XEAjax.interceptor.use(function (request, next) {
  var mock = mateMockItem(request)
  if (mock) {
    mock.sendResponse(request, next)
  } else {
    next()
  }
})

export default {mock, setup}
