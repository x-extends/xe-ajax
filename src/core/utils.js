'use strict'

/* eslint-disable valid-typeof */
var STRING_UNDEFINED = 'undefined'
var encode = encodeURIComponent
var isNodeJS = typeof window === STRING_UNDEFINED && typeof process !== STRING_UNDEFINED
var isFetchAbortController = typeof AbortController !== STRING_UNDEFINED && typeof AbortSignal !== STRING_UNDEFINED
var $console = typeof console === STRING_UNDEFINED ? '' : console
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

function stringifyParams (resultVal, resultKey, isArr) {
  var result = []
  objectEach(resultVal, function (item, key) {
    var _arr = isArray(item)
    if (isPlainObject(item) || _arr) {
      result = result.concat(stringifyParams(item, resultKey + '[' + key + ']', _arr))
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

  IS_N: isNodeJS, // nodejs 环境
  IS_F: isNodeJS ? false : !!self.fetch, // 支持 fetch
  IS_A: !(typeof Blob === STRING_UNDEFINED || typeof FormData === STRING_UNDEFINED || typeof FileReader === STRING_UNDEFINED), // IE10+ 支持Blob
  IS_FAC: isFetchAbortController, // fetch 是否支持 AbortController AbortSignal
  IS_DP: Object.defineProperty && ({}).__defineGetter__, // ie7-8 false

  isFData: function (obj) {
    return typeof FormData !== STRING_UNDEFINED && obj instanceof FormData
  },

  isURLSParams: function (obj) {
    return typeof URLSearchParams !== STRING_UNDEFINED && obj instanceof URLSearchParams
  },

  isCrossOrigin: function (url) {
    if (!isNodeJS) {
      var matchs = ('' + url).match(/(\w+:)\/{2}((.*?)\/|(.*)$)/)
      if (matchs && matchs.length > 2) {
        return matchs[1] !== $locat.protocol || matchs[2].split('/')[0] !== $locat.host
      }
    }
    return false
  },

  isStr: function (val) {
    return typeof val === 'string'
  },

  isObj: function (obj) {
    return obj && typeof obj === 'object'
  },

  isPlainObject: isPlainObject,

  isFn: function (obj) {
    return typeof obj === 'function'
  },

  err: function (e) {
    var outError = $console.error ? $console.error : ''
    if (outError) {
      outError(e)
    }
  },

  getOrigin: getLocatOrigin,

  getBaseURL: function () {
    if (isNodeJS) {
      return ''
    }
    var pathname = $locat.pathname
    var lastIndex = lastIndexOf(pathname, '/') + 1
    return getLocatOrigin() + (lastIndex === pathname.length ? pathname : pathname.substring(0, lastIndex))
  },

  objectEach: objectEach,

  // Serialize body
  serialize: function (body) {
    var _arr
    var params = []
    objectEach(body, function (item, key) {
      if (item !== undefined) {
        _arr = isArray(item)
        if (isPlainObject(item) || _arr) {
          params = params.concat(stringifyParams(item, key, _arr))
        } else {
          params.push(encode(key) + '=' + encode(item === null ? '' : item))
        }
      }
    })
    return params.join('&').replace(/%20/g, '+')
  },

  assign: Object.assign || function (target) {
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

  trim: function (str) {
    return ('' + str).replace(/(^\s*)|(\s*$)/g, '')
  },

  includes: function (array, val) {
    return lastIndexOf(array, val) > -1
  },

  arrayEach: function (array, callback, context) {
    for (var index = 0, len = array.length; index < len; index++) {
      callback.call(context, array[index], index, array)
    }
  },

  headersEach: function (headers, callabck) {
    if (headers && headers.forEach) {
      headers.forEach(callabck)
    }
  },

  clearContext: function (XEAjax) {
    XEAjax.$context = XEAjax.$Promise = null
  }
}

module.exports = utils
