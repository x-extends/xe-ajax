export function XEHeaders () {
  this._state = {}

  this.set = function (key, value) {
    this._state[key] = [value]
  }

  this.get = function (key) {
    return this.has(key) ? null : this._state[key].join(', ')
  }

  this.append = function (key, value) {
    if (this.has(key)) {
      return this._state[key].push(value)
    } else {
      this.set(key, value)
    }
  }

  this.has = function (key) {
    return this._state[key]
  }

  this['delete'] = function (key) {
    delete this._state[key]
  }
}

export default XEHeaders
