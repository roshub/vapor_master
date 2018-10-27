'use strict'

const mongoose = require('mongoose')
const validate = require('../utils')

const paramSub = new mongoose.Schema({
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
  subscriberPath: {
    type: String,
    index: true,
    required: true,
    maxlength: validate.maxPath,
    match: validate.pathRe,
  },
  subscriberUri: {
    type: String,
    index: true,
    required: true,
    maxlength: validate.maxUri,
    match: validate.uriRe,
  },
  subscriberIpv4: {
    type: String,
    index: true,
    required: true,
    match: validate.ipv4Re,
  },
})

module.exports = paramSub
