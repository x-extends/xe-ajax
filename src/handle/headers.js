import { objectEach, objectAssign } from '../core/utils'

function toKey (name) {
  return String(name).toLowerCase()
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

function $Headers (headers) {
  this._map = {}
  if (headers instanceof $Headers) {
    headers.forEach(function (value, name) {
      this.set(name, value)
    }, this)
  } else {
    objectEach(headers, function (value, name) {
      this.set(name, value)
    }, this)
  }
}

objectAssign($Headers.prototype, {
  set: function (name, value) {
    this._map[toKey(name)] = value
  },
  get: function (name) {
    var _key = toKey(name)
    return this.has(_key) ? this._map[_key] : null
  },
  append: function (name, value) {
    var _key = toKey(name)
    if (this.has(_key)) {
      this._map[_key] = this._map[_key] + ', ' + value
    } else {
      this._map[_key] = '' + value
    }
  },
  has: function (name) {
    return this._map.hasOwnProperty(toKey(name))
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
  'delete': function (name) {
    delete this._map[toKey(name)]
  },
  forEach: function (callback, context) {
    objectEach(this._map, function (value, name, state) {
      callback.call(context, value, name, this)
    }, this)
  }
})

export var XEHeaders = typeof Headers === 'undefined' ? $Headers : Headers
