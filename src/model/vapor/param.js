'use strict'

const mongoose = require('mongoose')
const validate = require('../utils')
const debug = require('debug')('vapormaster:model/vapor/param')

const param = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
    required: true,
  },
  keyPath: {
    type: String,
    index: true,
    unique: true,
    required: true,
    maxlength: validate.maxPath,
    match: validate.pathRe,
  },
  valueType: {
    type: String,
    enum: ['null', 'string', 'number', 'boolean', 'array'],
    required: true,
  },
  arrayValue: {
    type: mongoose.Schema.Types.Mixed,
    required: function () { return this.valueType === 'array' }
  },
  stringValue: {
    type: String,
    validate: {
      validator : function (v) {
        return typeof v === 'string'
      },
      message: '{PATH} must be a string!'
    },
    required: function () { 
      return (this.valueType === 'string' && !(typeof this.stringValue === 'string'))
    },
  },
  numberValue: {
    type: Number,
    required: function () { return this.valueType === 'number' }
  },
  booleanValue: {
    type: Boolean,
    required: function () { return this.valueType === 'boolean' }
  },
  creatorPath: {
    type: String,
    required: true,
    maxlength: validate.maxPath,
    match: validate.pathRe,
  },
  creatorIpv4: {
    type: String,
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
    case 'array':
      return this.arrayValue
  }
  return null // if value isnt string, number, or boolean its null
}

module.exports = param
