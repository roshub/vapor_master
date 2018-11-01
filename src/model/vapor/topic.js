'use strict'

const mongoose = require('mongoose')
const validate = require('../utils')

const topic = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
    required: true,
  },
  touched:
  {
    date: {
      type: Date,
      default: Date.now,
    },
    ipv4: {
      type: String,
      index: true,
      required: true,
      match: validate.ipv4Re,
    },
  },
  topicPath: {
    type: String,
    index: true,
    required: true,
    maxlength: validate.maxPath,
    match: validate.pathRe,
  },
  msgType: {
    type: String,
    index: true,
    maxlength: validate.maxPackage,
    match: validate.packageRe,
  },
})

module.exports = topic
