import XEAjax from '../ajax/constructor'
import { isArray, isFunction, random } from '../ajax/util'

var defineMockServices = []
var setupDefaults = {
  baseURL: location.origin,
  timeout: '20-400',
  log: true
}

function XEMockService (path, method, xhr, options) {
  if (path && method) {
    this.path = path
    this.method = method
    this.xhr = xhr
    this.options = options
  } else {
    throw new TypeError('path and method cannot be empty')
  }
}

Object.assign(XEMockService.prototype, {
  getXHR: function (request, time) {
    var mock = this
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        Promise.resolve(isFunction(mock.xhr) ? mock.xhr(request, {status: 200, response: null, headers: null}) : mock.xhr)
        .then(function (xhr) {
          resolve(mock.getResponse(xhr, 200))
        }).catch(function (xhr) {
          reject(mock.getResponse(xhr, 500))
        })
      }, time)
    })
  },
  getResponse: function (xhr, status) {
    if (xhr && (xhr.response || xhr.hasOwnProperty('response')) && (xhr.status || xhr.hasOwnProperty('status'))) {
      return xhr
    }
    return {status: status, response: xhr, headers: null}
  },
  reply: function (request, next) {
    var log = this.options.log
    var time = getTime(this.options.timeout)
    return this.getXHR(request, time).then(function (xhr) {
      next(xhr)
      log && console.info('XEMock:\nRequest URL: ' + request.getUrl() + '\nRequest Method: ' + request.method.toLocaleUpperCase() + ' => Status Code: ' + xhr.status + ' => Time: ' + time + 'ms')
    })
  }
})

function getTime (timeout) {
  var matchs = timeout.match(/(\d+)-(\d+)/)
  return matchs.length === 3 ? random(parseInt(matchs[1]), parseInt(matchs[2])) : 0
}

function mateMockItem (request) {
  var url = (request.getUrl() || '').split(/\?|#/)[0]
  return defineMockServices.find(function (item) {
    if (request.method.toLowerCase() === item.method.toLowerCase()) {
      var done = false
      var pathVariable = []
      var matchs = url.match(new RegExp(item.path.replace(/{[^{}]+}/g, function (name) {
        pathVariable.push(name.substring(1, name.length - 1))
        return '([^/]+)'
      }) + '(/.*)?'))
      item.pathVariable = {}
      done = matchs && matchs.length === pathVariable.length + 2 && !matchs[matchs.length - 1]
      if (done && pathVariable.length) {
        pathVariable.forEach(function (key, index) {
          item.pathVariable[key] = matchs[index + 1]
        })
      }
      return done
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
        if (item.xhr) {
          item.method = String(item.method || 'get')
          defineMockServices.push(new XEMockService(item.path, item.method, item.xhr, options))
        }
        defineMocks(item.children, options, item.path)
      }
    })
  }
}

/**
  * XEMock 虚拟服务
  *
  * @param Array/String path 路径数组/请求路径
  * @param String method 请求方法
  * @param Object/Function xhr 数据或返回数据方法
  * @param Object options 参数
  */
export function Mock (path, method, xhr, options) {
  defineMocks(isArray(path) ? (options = method, path) : [{path: path, method: method, xhr: xhr}], Object.assign({}, setupDefaults, options))
}

['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].forEach(function (method) {
  Mock[method] = function (url, xhr, options) {
    Mock(url, method, xhr, options)
  }
})

/**
 * 设置全局参数
 *
 * @param Object options 参数
 */
export var setup = Mock.setup = function setup (options) {
  Object.assign(setupDefaults, options)
}

XEAjax.interceptor.use(function (request, next) {
  var mock = mateMockItem(request)
  if (mock) {
    request.pathVariable = mock.pathVariable
    mock.reply(request, next)
  } else {
    next()
  }
})

export default Mock
