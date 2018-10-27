'use strict'

const mongoose = require('mongoose')
const validate = require('../utils')

const param = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
    required: true,
  },
  keyPath: {
    type: String,
    index: true,
    required: true,
    maxlength: validate.maxPath,
    match: validate.pathRe,
  },
  valueType: {
    type: String,
    enum: ['null', 'string', 'number', 'boolean'],
    required: true,
  },
  stringValue: {
    type: String,
    required: function () { return this.valueType === 'string' },
  },
  numberValue: {
    type: Number,
    required: function () { return this.valueType === 'number' },
  },
  booleanValue: {
    type: Boolean,
    required: function () { return this.valueType === 'boolean' },
  },
  creatorPath: {
    type: String,
    index: true,
    required: true,
    maxlength: validate.maxPath,
    match: validate.pathRe,
  },
  creatorIpv4: {
    type: String,
    index: true,
    required: true,
    match: validate.ipv4Re,
  },
})

param.methods.paramValue = function () {
  switch (this.valueType) {
    case 'string':
      return this.stringValue
    case 'number':
      return this.numberValue
    case 'boolean':
      return this.booleanValue
  }
  return null // if value isnt string, number, or boolean its null
}

module.exports = param
