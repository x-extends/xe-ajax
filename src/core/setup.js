'use strict'

var utils = require('./utils')

var setupDefaults = {
  method: 'GET',
  baseURL: utils.getBaseURL(),
  mode: 'cors',
  cache: 'default',
  credentials: 'same-origin',
  redirect: 'follow',
  bodyType: 'json-data',
  headers: {
    'Accept': 'application/json, text/plain, */*'
  }
}

module.exports = setupDefaults
