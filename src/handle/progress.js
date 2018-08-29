'use strict'

function XEProgress () {
  this.time = 0
  this.speed = 0
  this.loaded = 0
  this.value = 0
  this.total = 0
  this.onupload = this.onload = null
}

module.exports = XEProgress
