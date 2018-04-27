'use strict'

var utils = require('./utils')

var setupDefaults = {
  method: 'GET',
  baseURL: utils.getBaseURL(),
  cache: 'default',
  credentials: 'same-origin',
  bodyType: 'json-data',
  log: 'development' !== 'production',
  headers: {},
  validateStatus: function (response) {
    return response.status >= 200 && response.status < 300
  }
}

module.exports = setupDefaults
