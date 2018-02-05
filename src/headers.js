import { objectAssign, eachObj } from './util'

export function toKey (key) {
  return String(key).toLowerCase()
}

export function XEHeaders () {
  this._state = {}

  this.set = function (key, value) {
    this._state[toKey(key)] = [value]
  }

  this.get = function (key) {
    var _key = toKey(key)
    return this.has(_key) ? this._state[_key].join(', ') : null
  }

  this.append = function (key, value) {
    var _key = toKey(key)
    if (this.has(_key)) {
      return this._state[_key].push(value)
    } else {
      this.set(_key, value)
    }
  }

  this.has = function (key) {
    return !!this._state[toKey(key)]
  }

  this['delete'] = function (key) {
    delete this._state[toKey(key)]
  }
}

objectAssign(XEHeaders.prototype, {
  forEach: function (callback, context) {
    eachObj(this._state, function (value, key, state) {
      callback.call(context, value.join(', '), state)
    })
  }
})

export default XEHeaders
