'use strict'

var encode = encodeURIComponent
var isNodeJS = typeof window === 'undefined' && typeof process !== 'undefined'
var $locat = ''

if (!isNodeJS) {
  $locat = location
}

function isPlainObject (val) {
  return val ? val.constructor === Object : false
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

function objectEach (obj, iteratee, context) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      iteratee.call(context, obj[key], key, obj)
    }
  }
}

function parseParam (resultVal, resultKey, isArr) {
  var result = []
  objectEach(resultVal, function (item, key) {
    if (isPlainObject(item) || isArray(item)) {
      result = result.concat(parseParam(item, resultKey + '[' + key + ']', isArray(item)))
    } else {
      result.push(encode(resultKey + '[' + (isArr ? '' : key) + ']') + '=' + encode(item === null ? '' : item))
    }
  })
  return result
}

function getLocatOrigin () {
  return isNodeJS ? '' : ($locat.origin || ($locat.protocol + '//' + $locat.host))
}

var utils = {

  _N: isNodeJS, // nodejs 环境
  _F: isNodeJS ? false : !!self.fetch, // 支持 fetch
  _A: !(typeof Blob === 'undefined' || typeof FormData === 'undefined' || typeof FileReader === 'undefined'), // IE10+ 支持Blob

  isFormData: function (obj) {
    return typeof FormData !== 'undefined' && obj instanceof FormData
  },

  isCrossOrigin: function (url) {
    return !isNodeJS && /(\w+:)\/{2}((.*?)\/|(.*)$)/.test(url) && (RegExp.$1 !== $locat.protocol || RegExp.$2.split('/')[0] !== $locat.host)
  },

  isString: function (val) {
    return typeof val === 'string'
  },

  isObject: function (obj) {
    return obj && typeof obj === 'object'
  },

  isPlainObject: isPlainObject,

  isFunction: function (obj) {
    return typeof obj === 'function'
  },

  getLocatOrigin: getLocatOrigin,

  getBaseURL: function () {
    if (isNodeJS) {
      return ''
    }
    var pathname = $locat.pathname
    var lastIndex = lastIndexOf(pathname, '/') + 1
    return getLocatOrigin() + (lastIndex === pathname.length ? pathname : pathname.substring(0, lastIndex))
  },

  objectEach: objectEach,

  // Serialize Body
  serialize: function (body) {
    var params = []
    objectEach(body, function (item, key) {
      if (item !== undefined) {
        if (isPlainObject(item) || isArray(item)) {
          params = params.concat(parseParam(item, key, isArray(item)))
        } else {
          params.push(encode(key) + '=' + encode(item === null ? '' : item))
        }
      }
    })
    return params.join('&').replace(/%20/g, '+')
  },

  objectAssign: Object.assign || function (target) {
    var args = arguments
    for (var source, index = 1, len = args.length; index < len; index++) {
      source = args[index]
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          target[key] = source[key]
        }
      }
    }
    return target
  },

  arrayIndexOf: function (array, val) {
    for (var index = 0, len = array.length; index < len; index++) {
      if (val === array[index]) {
        return index
      }
    }
    return -1
  },

  arrayEach: function (array, callback, context) {
    for (var index = 0, len = array.length; index < len; index++) {
      callback.call(context, array[index], index, array)
    }
  },

  clearContext: function (XEAjax) {
    XEAjax.$context = XEAjax.$Promise = null
  }
}

module.exports = utils
