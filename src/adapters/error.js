
function getErrorMessage (message) {
  return new TypeError(message)
}

var errorExports = {
  aborted: function () {
    return getErrorMessage('The user aborted a request.')
  },
  timeout: function () {
    return getErrorMessage('Request timeout.')
  },
  failed: function () {
    return getErrorMessage('Network request failed.')
  }
}

module.exports = errorExports
