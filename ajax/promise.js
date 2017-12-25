import { isFunction } from './util'

export function XEPromise (executor, context) {
  if (executor instanceof Promise) {
    this.promise = executor
  } else {
    this.promise = new Promise(executor.bind(context))
  }
  this.context = context
}

function bindPromiseContext (callback) {
  return isFunction(callback) ? callback.bind(this.context) : callback
}

Object.assign(XEPromise.prototype, {

  then: function (resolved, rejected) {
    return new XEPromise(this.promise.then(bindPromiseContext.call(this, resolved), bindPromiseContext.call(this, rejected)), this.context)
  },

  catch: function (rejected) {
    return new XEPromise(this.promise.catch(bindPromiseContext.call(this, rejected)), this.context)
  },

  finally: function (resolved) {
    return new XEPromise(this.promise.then(bindPromiseContext.call(this, resolved)).catch(bindPromiseContext.call(this, resolved)), this.context)
  }

})

Object.assign(XEPromise, {

  all: function (iterable) {
    return new XEPromise(Promise.all(iterable), this.context)
  },

  race: function (reason) {
    return new XEPromise(Promise.race(reason), this.context)
  },

  resolve: function (reason) {
    return new XEPromise(Promise.resolve(reason), this.context)
  },

  reject: function (reason) {
    return new XEPromise(Promise.reject(reason), this.context)
  }

})
