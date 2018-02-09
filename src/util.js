export var isArray = Array.isArray || function (obj) {
  return obj ? obj.constructor === Array : false
}

export function isFormData (obj) {
  return typeof FormData !== 'undefined' && obj instanceof FormData
}

export function isCrossOrigin (request) {
  if (/(\w+:)\/{2}((.*?)\/|(.*)$)/.test(request.url)) {
    if (RegExp.$1 !== location.protocol || RegExp.$2.split('/')[0] !== location.host) {
      return true
    }
  }
  return false
}

export function isObject (obj) {
  return obj && typeof obj === 'object'
}

export function isFunction (obj) {
  return typeof obj === 'function'
}

export function getBaseURL () {
  var pathname = location.pathname
  var lastIndex = lastIndexOf(pathname, '/') + 1
  return location.origin + (lastIndex === pathname.length ? pathname : pathname.substring(0, lastIndex))
}

export function lastIndexOf (str, val) {
  if (isFunction(str.lastIndexOf)) {
    return str.lastIndexOf(val)
  } else {
    for (var len = str.length - 1; len >= 0; len--) {
      if (val === str[len]) {
        return len
      };
    }
  }
  return -1
}

export function eachObj (obj, iteratee, context) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      iteratee.call(context, obj[key], key, obj)
    }
  }
}

export function parseParam (resultVal, resultKey, isArr) {
  var result = []
  eachObj(resultVal, function (item, key) {
    if (isObject(item)) {
      result = result.concat(parseParam(item, resultKey + '[' + key + ']', isArray(item)))
    } else {
      result.push(encodeURIComponent(resultKey + '[' + (isArr ? '' : key) + ']') + '=' + encodeURIComponent(item))
    }
  })
  return result
}

// Serialize Body
export function serialize (body) {
  var params = []
  eachObj(body, function (item, key) {
    if (item !== undefined) {
      if (isObject(item)) {
        params = params.concat(parseParam(item, key, isArray(item)))
      } else {
        params.push(encodeURIComponent(key) + '=' + encodeURIComponent(item))
      }
    }
  })
  return params.join('&').replace(/%20/g, '+')
}

export var objectAssign = Object.assign || function (target) {
  for (var source, index = 1, len = arguments.length; index < len; index++) {
    source = arguments[index]
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key]
      }
    }
  }
  return target
}

export function arrayEach (array, callback, context) {
  if (array.forEach) {
    array.forEach(callback, context)
  } else {
    for (var index = 0, len = array.length || 0; index < len; index++) {
      callback.call(context || global, array[index], index, array)
    }
  }
}
