'use strict'
const Config = require('./src/config.js')
const Server = require('./src/server')
const URL = require('url-parse')
const config = Config.config();

const defaults= {
  'clean-db': true,
  db: 'mongodb://localhost:27017/vapor_master',
  ROS_MASTER_URI: 'http://localhost:11311'
}

if(config.read('help') || config.read('h')){
  console.log(`Usage vapor-master`)
  console.log(`\t`, `--clean-db`)
  console.log(`\t`, `--no-clean-db`)
  console.log(`\t`, `--db=[mongo-uri]`)
  console.log(`\t`, `--dboptions=[mongo-options]`)
  console.log(`\t`, `--ROS_MASTER_URI=[ros-master-uri]`)
  console.log(`\t`, `--no_shutdown`)
  process.exit(0)
}

let options = config.readAll() || {};
delete options._
delete options['$0']

if (options['no-clean-db'] || options['no-clean-db'] === false){
  if(!options['clean-db'] && options['clean-db'] !== false ){
    options['clean-db'] = !options['no-clean-db'];
  }
  delete options['no-clean-db']
}

if (Object.keys(options).length == 0){
  options = defaults
} else if (Object.keys(options).length == 1) {
  if (options.hasOwnProperty('ROS_MASTER_URI')){
    if (options.ROS_MASTER_URI == ''){
      options.ROS_MASTER_URI = defaults.ROS_MASTER_URI
    }
    options.db = defaults.db;
    options['clean-db'] = true;
  }
} else if (Object.keys(options).length == 2) {
  if (options.hasOwnProperty('ROS_MASTER_URI') &&
      options.hasOwnProperty('clean-db')){
    options.db = defaults.db;
    if (options.ROS_MASTER_URI == ''){
      options.ROS_MASTER_URI = defaults.ROS_MASTER_URI
    }
  }
}

let printoptions = Object.assign({},options)
delete printoptions.dboptions;
const dbUri = new URL(printoptions.db);
delete printoptions.db;
printoptions.dbHost = dbUri.host
printoptions.dbName = dbUri.pathname
console.log("Vapor Master launching\nConfiguration: ")
console.log(printoptions)

let server = new Server(options)
server.start(false)