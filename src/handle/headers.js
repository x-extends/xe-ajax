'use strict'

var utils = require('../core/utils')

function toHeaderKey (name) {
  return ('' + name).toLowerCase()
}

function getObjectIterators (obj, getIndex) {
  var result = []
  for (var name in obj) {
    if (obj.hasOwnProperty(name)) {
      var value = obj[name]
      result.push([name, value, [name, value]][getIndex])
    }
  }
  return result
}

function getIteratorResult (iterator, value) {
  var done = iterator.$index++ >= iterator.$list.length
  return {done: done, value: done ? undefined : value}
}

function XEIterator (iterator, value) {
  this.$index = 0
  this.$list = getObjectIterators(iterator, value)
  this.next = function () {
    return getIteratorResult(this, this.$list[this.$index])
  }
}

function XEHeadersPolyfill (headers) {
  this._d = {}
  if (headers instanceof XEHeaders) {
    headers.forEach(function (value, name) {
      this.set(name, value)
    }, this)
  } else {
    utils.objectEach(headers, function (value, name) {
      this.set(name, value)
    }, this)
  }
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
  if (this.has(_key)) {
    this._d[_key] = this._d[_key] + ', ' + value
  } else {
    this._d[_key] = '' + value
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
