import { objectAssign, arrayEach } from '../core/utils'
import { XEHeaders } from '../entity/headers'
import { responseInterceptor } from '../entity/interceptor'
import { XEReadableStream } from './readableStream'
import { ResponseXHR } from './responseXHR'

function getResponse (request, result) {
  if (result) {
    if (typeof Response === 'undefined') {
      if (result.constructor === XEResponse) {
        return result
      }
    } else if (result.constructor === Response || result.constructor === XEResponse) {
      return result
    }
  }
  return new XEResponse(request, new ResponseXHR(result))
}

export function responseComplete (request, result, complete) {
  request.$complete = true
  responseInterceptor(request, getResponse(request, result)).then(function (response) {
    complete(response)
  })
}

export function XEResponse (request, xhr) {
  var that = this
  var $resp = {}

  arrayEach(['body', 'bodyUsed', 'url', 'headers', 'status', 'statusText', 'ok', 'redirected', 'type'], function (name) {
    Object.defineProperty(that, name, {
      get: function () {
        return $resp[name]
      }
    })
  })

  $resp.body = new XEReadableStream(xhr.responseText || null, request)
  $resp.bodyUsed = false
  $resp.url = request.url
  $resp.headers = parseXHRHeaders($resp, xhr)
  $resp.status = xhr.status
  $resp.statusText = parseStatusText($resp, xhr)
  $resp.ok = request.validateStatus(this)
  $resp.redirected = $resp.status === 302
  $resp.type = 'basic'
}

objectAssign(XEResponse.prototype, {
  json: function () {
    return this.body._getBody().then(function (body) {
      return JSON.parse(body)
    })
  },
  text: function () {
    return this.body._getBody()
  }
})

// 解析响应头
function parseXHRHeaders ($resp, xhr) {
  var headers = new XEHeaders()
  if (xhr.getAllResponseHeaders) {
    var allResponseHeaders = xhr.getAllResponseHeaders().trim()
    if (allResponseHeaders) {
      arrayEach(allResponseHeaders.split('\n'), function (row) {
        var index = row.indexOf(':')
        headers.set(row.slice(0, index).trim(), row.slice(index + 1).trim())
      })
    }
  }
  return headers
}

// 解析状态信息
function parseStatusText ($resp, xhr) {
  // if no content
  if (xhr.status === 1223 || xhr.status === 204) {
    return 'No Content'
  } else if (xhr.status === 304) {
    // if not modified
    return 'Not Modified'
  } else if (xhr.status === 404) {
    // if not found
    return 'Not Found'
  }
  return (xhr.statusText || xhr.statusText || '').trim()
}
