'use strict'

const mongoose = require('mongoose')
const validate = require('../utils')

const servicePro = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
    required: true,
  },
  servicePath: {
    type: String,
    index: true,
    required: true,
    maxlength: validate.maxPath,
    match: validate.pathRe,
  },
  serviceUri: {
    type: String,
    index: true,
    required: true,
    maxlength: validate.maxUri,
    match: validate.uriRe,
  },
  providerPath: {
    type: String,
    index: true,
    required: true,
    maxlength: validate.maxPath,
    match: validate.pathRe,
  },
  providerUri: {
    type: String,
    index: true,
    required: true,
    maxlength: validate.maxUri,
    match: validate.uriRe,
  },
  providerIpv4: {
    type: String,
    index: true,
    required: true,
    match: validate.ipv4Re,
  },
})

module.exports = servicePro
