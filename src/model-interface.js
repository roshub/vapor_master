/**
 *  Singleton object of the database model that can be accessed 
 *  statically through 'require'.
 */
const Model = require('./model/db.js')

const Config = require('./config.js')

const DB_KEY = Symbol.for("app.vapormaster.db")

const default_db_uri = 'mongodb://localhost:27017/roshub_vapor_master'

var globalSymbols = Object.getOwnPropertySymbols(global)
var hasDb = (globalSymbols.indexOf(DB_KEY) > -1)

if(!hasDb){
    var config;
    config = Config.config({db:default_db_uri})
    var db_uri = config.read('db')

    global[DB_KEY] = {
        db: new Model(db_uri)
    }
}

const instance = global[DB_KEY].db

module.exports = instance;