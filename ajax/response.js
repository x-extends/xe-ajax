import { isString } from './util'

export function XEAjaxResponse (request, xhr) {
  this.request = request
  this.url = request.url
  this.headers = {}
  this.status = 0
  this.statusText = ''
  this.bodyText = ''

  // xhr handle
  if (xhr && xhr.response !== undefined && xhr.status !== undefined) {
    this.status = xhr.status || this.status

    // cancel xhr
    if (request.ABORT_STATUS) {
      var cancelXHR = request.ABORT_RESPONSE
      if (cancelXHR && cancelXHR.response !== undefined && cancelXHR.status !== undefined) {
        this.body = cancelXHR.response
        this.status = cancelXHR.status || this.status
      } else {
        this.body = cancelXHR === undefined ? xhr.response : cancelXHR
      }
    } else {
      this.body = xhr.response
      this.bodyText = xhr.responseText || ''
    }

    // if no content
    if (this.status === 1223 || this.status === 204) {
      this.statusText = 'No Content'
    } else if (this.status === 304) {
      // if not modified
      this.statusText = 'Not Modified'
    } else {
      // statusText
      this.statusText = (xhr.statusText || this.statusText).trim()
    }

    // parse headers
    if (xhr.getAllResponseHeaders) {
      var allResponseHeaders = xhr.getAllResponseHeaders().trim()
      if (allResponseHeaders) {
        allResponseHeaders.split('\n').forEach(function (row) {
          var index = row.indexOf(':')
          this.headers[row.slice(0, index).trim()] = row.slice(index + 1).trim()
        }, this)
      }
    } else if (xhr.headers) {
      Object.assign(this.headers, xhr.headers)
    }
  } else if (xhr) {
    this.body = xhr
  }

  // stringify bodyText
  try {
    if (this.body && !this.bodyText) {
      this.bodyText = JSON.stringify(this.body)
    }
  } catch (e) {}

  // parse body
  if (this.body && isString(this.body)) {
    try {
      this.body = JSON.parse(this.body)
    } catch (e) {
      this.body = this.bodyText
    }
  }
}

export default XEAjaxResponse
