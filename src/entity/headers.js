import { objectEach } from '../core/utils'

function toKey (key) {
  return String(key).toLowerCase()
}

function getObjectIterators (obj, getIndex) {
  var result = []
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key]
      result.push([key, value.join(', '), [key, value.join(', ')]][getIndex])
    }
  }
  return result
}

function getIteratorResult (iterator, value) {
  var done = iterator.$index++ >= iterator.$list.length
  return {done: done, value: done ? undefined : value}
}

function XEIterator (list) {
  this.$index = 0
  this.$list = list
  this.next = function () {
    return getIteratorResult(this, this.$list[this.$index])
  }
}

export var XEHeaders = typeof Headers === 'function' ? Headers : function (heads) {
  var $state = {}

  this.set = function (key, value) {
    $state[toKey(key)] = [value]
  }

  this.get = function (key) {
    var _key = toKey(key)
    return this.has(_key) ? $state[_key].join(', ') : null
  }

  this.append = function (key, value) {
    var _key = toKey(key)
    if (this.has(_key)) {
      return $state[_key].push(value)
    } else {
      this.set(_key, value)
    }
  }

  this.has = function (key) {
    return !!$state[toKey(key)]
  }

  this.keys = function () {
    return new XEIterator(getObjectIterators($state, 0))
  }

  this.values = function () {
    return new XEIterator(getObjectIterators($state, 1))
  }

  this.entries = function () {
    return new XEIterator(getObjectIterators($state, 2))
  }

  this['delete'] = function (key) {
    delete $state[toKey(key)]
  }

  this.forEach = function (callback, context) {
    objectEach($state, function (value, key, state) {
      callback.call(context, value.join(', '), key, this)
    }, this)
  }

  if (heads instanceof XEHeaders) {
    heads.forEach(function (value, key) {
      this.set(key, value)
    }, this)
  } else {
    objectEach(heads, function (value, key) {
      this.set(key, value)
    }, this)
  }
}
