'use strict'

var utils = require('../core/utils')

function toHeaderKey (name) {
  return ('' + name).toLowerCase()
}

function getObjectIterators (obj, getIndex) {
  var result = []
  utils.objectEach(obj, function (value, name) {
    result.push([name, value, [name, value]][getIndex])
  })
  return result
}

function getIteratorResult (iterator, value, UNDEFINED) {
  var done = iterator.$index++ >= iterator.$list.length
  return { done: done, value: done ? UNDEFINED : value }
}

function XEIterator (iterator, value) {
  this.$index = 0
  this.$list = getObjectIterators(iterator, value)
  this.next = function () {
    return getIteratorResult(this, this.$list[this.$index])
  }
}

function XEHeadersPolyfill (headers) {
  var that = this
  var defset = function (value, name) {
    that.set(name, value)
  }
  that._d = {}
  utils[headers instanceof XEHeaders ? 'headersEach' : 'objectEach'](headers, defset)
}

var headersPro = XEHeadersPolyfill.prototype

headersPro.set = function (name, value) {
  this._d[toHeaderKey(name)] = value
}
headersPro.get = function (name) {
  var _key = toHeaderKey(name)
  return this.has(_key) ? this._d[_key] : null
}
headersPro.append = function (name, value) {
  var _key = toHeaderKey(name)
  var store = this._d
  if (this.has(_key)) {
    store[_key] = store[_key] + ', ' + value
  } else {
    store[_key] = '' + value
  }
}
headersPro.has = function (name) {
  return this._d.hasOwnProperty(toHeaderKey(name))
}
headersPro.keys = function () {
  return new XEIterator(this._d, 0)
}
headersPro.values = function () {
  return new XEIterator(this._d, 1)
}
headersPro.entries = function () {
  return new XEIterator(this._d, 2)
}
headersPro['delete'] = function (name) {
  delete this._d[toHeaderKey(name)]
}
headersPro.forEach = function (callback, context) {
  utils.objectEach(this._d, callback, context)
}

var XEHeaders = typeof Headers === 'undefined' ? XEHeadersPolyfill : Headers

module.exports = XEHeaders
