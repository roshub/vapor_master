'use strict'

const mongoose = require('mongoose')
const validate = require('../utils')

const rosnode = new mongoose.Schema({
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
  failed: 
  {
    date: {
      type: Date,
      default: Date.now,
    },
    msg: {
      type: String,
      maxlength: 1024,
    },
  },
  rosnodePath: {
    type: String,
    index: true,
    maxlength: validate.maxPath,
    match: validate.pathRe,
  },
  rosnodeUri: {
    type: String,
    index: true,
    maxlength: validate.maxUri,
    match: validate.uriRe,
  },
})

module.exports = rosnode
