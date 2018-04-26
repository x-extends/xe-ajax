'use strict'

var XEResponse = require('../handle/response')
var utils = {

  isArray: Array.isArray || function (obj) {
    return obj ? obj.constructor === Array : false
  },

  isFormData: function (obj) {
    return typeof FormData !== 'undefined' && obj instanceof FormData
  },

  isCrossOrigin: function (url) {
    if (/(\w+:)\/{2}((.*?)\/|(.*)$)/.test(url)) {
      if (RegExp.$1 !== location.protocol || RegExp.$2.split('/')[0] !== location.host) {
        return true
      }
    }
    return false
  },

  isSupportAdvanced: function () {
    return typeof Blob === 'function' && typeof FormData === 'function' && typeof FileReader === 'function'
  },

  isString: function (val) {
    return typeof val === 'string'
  },

  isObject: function (obj) {
    return obj && typeof obj === 'object'
  },

  isPlainObject: function (val) {
    return val ? val.constructor === Object : false
  },

  isFunction: function (obj) {
    return typeof obj === 'function'
  },

  getLocatOrigin: function () {
    return location.origin || (location.protocol + '//' + location.host)
  },

  getBaseURL: function () {
    var pathname = location.pathname
    var lastIndex = utils.lastIndexOf(pathname, '/') + 1
    return utils.getLocatOrigin() + (lastIndex === pathname.length ? pathname : pathname.substring(0, lastIndex))
  },

  lastIndexOf: function (str, val) {
    if (utils.isFunction(str.lastIndexOf)) {
      return str.lastIndexOf(val)
    } else {
      for (var len = str.length - 1; len >= 0; len--) {
        if (val === str[len]) {
          return len
        };
      }
    }
    return -1
  },

  objectEach: function (obj, iteratee, context) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        iteratee.call(context, obj[key], key, obj)
      }
    }
  },

  // Serialize Body
  serialize: function (body) {
    var params = []
    utils.objectEach(body, function (item, key) {
      if (item !== undefined) {
        if (utils.isPlainObject(item) || utils.isArray(item)) {
          params = params.concat(parseParam(item, key, utils.isArray(item)))
        } else {
          params.push(encodeURIComponent(key) + '=' + encodeURIComponent(item))
        }
      }
    })
    return params.join('&').replace(/%20/g, '+')
  },

  objectAssign: Object.assign || function (target) {
    for (var source, index = 1, len = arguments.length; index < len; index++) {
      source = arguments[index]
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          target[key] = source[key]
        }
      }
    }
    return target
  },

  arrayEach: function (array, callback, context) {
    if (array.forEach) {
      array.forEach(callback, context)
    } else {
      for (var index = 0, len = array.length || 0; index < len; index++) {
        callback.call(context, array[index], index, array)
      }
    }
  },

  arrayIncludes: function (array, value) {
    if (array.includes) {
      return array.includes(value)
    } else {
      for (var index = 0, len = array.length || 0; index < len; index++) {
        if (array[index] === value) {
          return true
        }
      }
    }
    return false
  },

  clearXEAjaxContext: function (XEAjax) {
    XEAjax.$context = XEAjax.$Promise = null
  },

  // result to Response
  toResponse: function (resp, request) {
    if ((typeof Response === 'function' && resp.constructor === Response) || resp.constructor === XEResponse) {
      return resp
    }
    var options = {status: resp.status, statusText: resp.statusText, headers: resp.headers}
    if (utils.isSupportAdvanced()) {
      return new XEResponse(resp.body instanceof Blob ? resp.body : new Blob([utils.isString(resp.body) ? resp.body : JSON.stringify(resp.body)]), options, request)
    }
    return new XEResponse(utils.isString(resp.body) ? resp.body : JSON.stringify(resp.body), options, request)
  }
}

function parseParam (resultVal, resultKey, isArr) {
  var result = []
  utils.objectEach(resultVal, function (item, key) {
    if (utils.isPlainObject(item) || utils.isArray(item)) {
      result = result.concat(parseParam(item, resultKey + '[' + key + ']', utils.isArray(item)))
    } else {
      result.push(encodeURIComponent(resultKey + '[' + (isArr ? '' : key) + ']') + '=' + encodeURIComponent(item))
    }
  })
  return result
}

module.exports = utils
