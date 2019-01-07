/**
 *  Singleton object of the database model that can be accessed 
 *  statically through 'require'.
 */
const Model = require('./model/db.js')
const Config = require('./config.js')


const DB_KEY = Symbol.for("app.vapormaster.db")

var globalSymbols = Object.getOwnPropertySymbols(global)
var hasDb = (globalSymbols.indexOf(DB_KEY) > -1)


if(!hasDb){
  global[DB_KEY] = {
    db: new Model( Config.read('db') )
  }
}

const instance = global[DB_KEY].db

module.exports = instance;