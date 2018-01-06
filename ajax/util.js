export var isArray = Array.isArray || function (val) {
  return Object.prototype.toString.call(val) === '[object Array]'
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

export function isString (obj) {
  return typeof obj === 'string'
}

export function isFunction (obj) {
  return typeof obj === 'function'
}

export function isUndefined (obj) {
  return typeof obj === 'undefined'
}

export function random (min, max) {
  return min >= max ? min : ((min = min || 0) + Math.round(Math.random() * ((max || 9) - min)))
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
