const mongoose = require('mongoose')
//const cachegoose = require('cachegoose')
mongoose.Promise = Promise
require('mongoose-schema-jsonschema')(mongoose);
mongoose.set('debug', false)

class Db {
  constructor (uri, options) {
    this.uri = uri
    this.options = options || {}
    Object.assign(this.options, {   
      keepAlive: 200, 
      useNewUrlParser: true 
    })
    //this.cachegoose = cachegoose(mongoose);
    this.Vapor = require('./vapor')
  }

  connect(){
    return mongoose.connect(this.uri, this.options)
  }

  static mongoose(){
    return mongoose
  }
}

module.exports = Db
