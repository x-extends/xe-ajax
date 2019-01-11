'use strict'

var setupDefaults = {
  method: 'GET',
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
