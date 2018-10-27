'use strict'

const mongoose = require('mongoose')
const validate = require('../utils')

const topicXub = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['pub', 'sub'],
  },
  topicPath: {
    type: String,
    index: true,
    required: true,
    maxlength: validate.maxPath,
    match: validate.pathRe,
  },
  xubPath: {
    type: String,
    index: true,
    required: true,
    maxlength: validate.maxPath,
    match: validate.pathRe,
  },
  xubUri: {
    type: String,
    index: true,
    required: true,
    maxlength: validate.maxUri,
    match: validate.uriRe,
  },
  xubIpv4: {
    type: String,
    index: true,
    required: true,
    match: validate.ipv4Re,
  },
})

module.exports = topicXub
