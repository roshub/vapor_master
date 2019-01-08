'use strict'
const Config = require('./src/config.js')
const Server = require('./src/server')


if(Config.read('help') || Config.read('h')){
  console.log(`Usage vapor-master`)
  console.log(`\t`, `--clean-db`)
  console.log(`\t`, `--no-clean-db`)
  console.log(`\t`, `--db=[mongo-uri]`)
  console.log(`\t`, `--ROS_MASTER_URI=[ros-master-uri]`)
  process.exit(0)
}

let server = new Server()
server.start(false)