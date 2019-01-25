'use strict'
const Config = require('./src/config.js')
const Server = require('./src/server')

const config = Config.config();

const defaults= {
  clean_db: true,
  db: 'mongodb://localhost:27017/vapor_master',
  ROS_MASTER_URI: 'http://localhost:11311'
}

if(config.read('help') || config.read('h')){
  console.log(`Usage vapor-master`)
  console.log(`\t`, `--clean_db`)
  console.log(`\t`, `--no_clean_db`)
  console.log(`\t`, `--db=[mongo-uri]`)
  console.log(`\t`, `--ROS_MASTER_URI=[ros-master-uri]`)
  console.log(`\t`, `--no_shutdown`)
  process.exit(0)
}

let options = config.readAll() || {};
delete options._
delete options['$0']
if (Object.keys(options).length == 0){
  options = defaults
} else if (Object.keys(options).length == 1) {
  if (options.ROS_MASTER_URI || options.ROS_MASTER_URI == ''){
    if (options.ROS_MASTER_URI == ''){
      options.ROS_MASTER_URI = defaults.ROS_MASTER_URI
    }
    options.db = defaults.db;
    options.clean_db = true;  
  }
}
console.log("Vapor Master launching\nconfig: ")
console.log(options)

let server = new Server(options)
server.start(false)