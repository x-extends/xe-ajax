import XEAjax from '../ajax/constructor'
import { isArray, isFunction, random } from '../ajax/util'

var defineMockServices = []
var setupDefaults = {
  baseURL: location.origin,
  timeout: '10-200'
}

function XEMockService (path, method, response, options) {
  if (path && method) {
    this.path = path
    this.method = method
    this.response = response
    this.options = options
  } else {
    throw new TypeError('path and method cannot be empty')
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

function mateMockItem (request) {
  debugger
  var url = (request.getUrl() || '').split(/\?|#/)[0]
  return defineMockServices.find(function (item) {
    if (request.method === item.method) {
      let matchs = url.match(new RegExp(item.path.replace(/\*/g, '[^/]+') + '(/.*)?'))
      return matchs && matchs.length === 2 && !matchs[1]
    }
  })
}

function defineMocks (list, options, baseURL) {
  if (isArray(list)) {
    list.forEach(function (item) {
      if (item.path) {
        if (!baseURL) {
          baseURL = /\w+:\/{2}.*/.test(item.path) ? '' : options.baseURL
        }
        item.path = (baseURL ? baseURL.replace(/\/$/, '') + '/' : '') + item.path.replace(/^\//, '')
        if (item.response) {
          item.method = String(item.method || 'get')
          defineMockServices.push(new XEMockService(item.path, item.method, item.response, options))
        }
        defineMocks(item.children, options, item.path)
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
  * @param Array/String path 路径数组/请求路径
  * @param String method 请求方法
  * @param Object/Function response 数据或返回数据方法
  * @param Object options 参数
  */
export function mock (path, method, response, options) {
  defineMocks(isArray(path) ? (options = method, path) : [{path: path, method: method, response: response}], Object.assign({}, setupDefaults, options))
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
