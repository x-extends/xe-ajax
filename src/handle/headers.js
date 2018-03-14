import { objectEach, objectAssign } from '../core/utils'

function toKey (key) {
  return String(key).toLowerCase()
}

function getObjectIterators (obj, getIndex) {
  var result = []
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key]
      result.push([key, value, [key, value]][getIndex])
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

function $Headers (headers) {
  this._map = {}
  if (headers instanceof $Headers) {
    headers.forEach(function (value, key) {
      this.set(key, value)
    }, this)
  } else {
    objectEach(headers, function (value, key) {
      this.set(key, value)
    }, this)
  }
}

objectAssign($Headers.prototype, {
  set: function (key, value) {
    this._map[toKey(key)] = value
  },
  get: function (key) {
    var _key = toKey(key)
    return this.has(_key) ? this._map[_key] : null
  },
  append: function (key, value) {
    var _key = toKey(key)
    if (this.has(_key)) {
      this._map[key] = this._map[key] + ', ' + value
    } else {
      this._map[key] = '' + value
    }
  },
  has: function (key) {
    return this._map.hasOwnProperty(toKey(key))
  },
  keys: function () {
    return new XEIterator(this._map, 0)
  },
  values: function () {
    return new XEIterator(this._map, 1)
  },
  entries: function () {
    return new XEIterator(this._map, 2)
  },
  'delete': function (key) {
    delete this._map[toKey(key)]
  },
  forEach: function (callback, context) {
    objectEach(this._map, function (value, key, state) {
      callback.call(context, value, key, this)
    }, this)
  }
})

export var XEHeaders = typeof Headers === 'function' ? Headers : $Headers
