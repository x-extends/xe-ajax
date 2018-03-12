import { isString, objectAssign } from '../core/utils'

/**
 * response 转换 xhr 属性
 */
export function ResponseXHR (result) {
  try {
    var responseText = isString(result.body) ? result.body : JSON.stringify(result.body)
  } catch (e) {
    responseText = ''
  }
  this.status = result.status
  this.responseHeaders = result.headers
  this.response = responseText
  this.responseText = responseText
}

objectAssign(ResponseXHR.prototype, {
  getAllResponseHeaders: function () {
    var result = ''
    var responseHeader = this.responseHeaders
    if (responseHeader) {
      for (var key in responseHeader) {
        if (responseHeader.hasOwnProperty(key)) {
          result += key + ': ' + responseHeader[key] + '\n'
        }
      }
    }
    return result
  }
})
