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
rosnode.post('validation', function (doc, next){
  if (doc.touched && doc.failed){
    next(new Error("Validation: cannot have both touched and failed fields in vapor_rosnode"))
  } else if (!(doc.touched || doc.failed)){
    next(new Error("Validation: must have either touched or failed field in vapor_rosnode"))
  } else if (doc.touched && !doc.touched.ipv4){
    next(new Error("Validation: must have ipv4 field in touched filed in vapor_rosnode"))
  } else {
    next();
  }
});

module.exports = rosnode
