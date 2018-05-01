'use strict'

var encode = encodeURIComponent
var isNodeJS = typeof window === 'undefined' && typeof process !== 'undefined'
var utils = {

  isNodeJS: isNodeJS,
  isFetch: isNodeJS ? false : self.fetch !== 'undefined',
  isSupportAdvanced: !(typeof Blob === 'undefined' || typeof FormData === 'undefined' || typeof FileReader === 'undefined'),

  isFormData: function (obj) {
    return typeof FormData !== 'undefined' && obj instanceof FormData
  },

  isCrossOrigin: function (url) {
    if (!isNodeJS) {
      if (/(\w+:)\/{2}((.*?)\/|(.*)$)/.test(url)) {
        if (RegExp.$1 !== location.protocol || RegExp.$2.split('/')[0] !== location.host) {
          return true
        }
      }
    }
    return false
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
    return isNodeJS ? '' : (location.origin || (location.protocol + '//' + location.host))
  },

  getBaseURL: function () {
    if (isNodeJS) {
      return ''
    }
    var pathname = location.pathname
    var lastIndex = lastIndexOf(pathname, '/') + 1
    return utils.getLocatOrigin() + (lastIndex === pathname.length ? pathname : pathname.substring(0, lastIndex))
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
        if (utils.isPlainObject(item) || isArray(item)) {
          params = params.concat(parseParam(item, key, isArray(item)))
        } else {
          params.push(encode(key) + '=' + encode(item))
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

  arrayIndexOf: function (array, val) {
    if (array.indexOf) {
      return array.indexOf(val)
    } else {
      for (var index = 0, len = array.length; index < len; index++) {
        if (val === array[index]) {
          return index
        }
      }
    }
    return -1
  },

  arrayEach: function (array, callback, context) {
    if (array.forEach) {
      array.forEach(callback, context)
    } else {
      for (var index = 0, len = array.length; index < len; index++) {
        callback.call(context, array[index], index, array)
      }
    }
  },

  clearContext: function (XEAjax) {
    XEAjax.$context = XEAjax.$Promise = null
  }
}

function isArray (obj) {
  return obj ? obj.constructor === Array : false
}

function lastIndexOf (str, val) {
  for (var len = str.length - 1; len >= 0; len--) {
    if (val === str[len]) {
      return len
    };
  }
  return -1
}

function parseParam (resultVal, resultKey, isArr) {
  var result = []
  utils.objectEach(resultVal, function (item, key) {
    if (utils.isPlainObject(item) || isArray(item)) {
      result = result.concat(parseParam(item, resultKey + '[' + key + ']', isArray(item)))
    } else {
      result.push(encode(resultKey + '[' + (isArr ? '' : key) + ']') + '=' + encode(item))
    }
  })
  return result
}

module.exports = utils
