'use strict'
const xmlrpc = require('@roshub/express-xmlrpc')
const express = require('express')
const morgan = require('morgan')
const Model = require('./src/model-interface.js')
const Config = require('./src/config.js')
// singleton ros master server
const master = require('./src/master.js')
const debug = require('debug') ("vapor-master:index")
const uuidv1 = require('uuid/v1')
const paramUtil = require('./src/param-util.js')

// read environment variables
const DEFAULT_MASTER_URI = "http://localhost:11311"

var masterUri = process.env.ROS_MASTER_URI
process.env.DEBUG="*"
if (!masterUri || masterUri == "")
{
  debug("No ROS_MASTER_URI, defaulting to " + DEFAULT_MASTER_URI)
  masterUri = DEFAULT_MASTER_URI
}
const cleanDb = true

Model.connect().then(()=>{
  console.log("Connected to Database")
}).catch(()=>{console.error("db connection error"); exit(1)})
// parse uri string for server to listen at
master.setUri(masterUri)
// if clean database flag is set clear all data from db
if (cleanDb) {
  master.cleanDb()
}

// use express to listen for incoming xmlrpc method requests
const app = express()

// setup request logging
//app.use(morgan('combined'))

// xmlrpc message parsing middleware
// parses request stream & sets request.body.method & request.body.params
app.use(xmlrpc.bodyParser)

// ros master implemented as express route handler
// gets method & parameters from request.body values set by middleware
// calls xmlrpc.serializeResponse() to generate response from return values
app.post('*', xmlrpc.apiHandler(
  master.api, master, master.onError, master.onMiss))

// listen for xmlrpc method calls at ros master uri
master.server = app.listen(master.uri.port, master.uri.hostname)

// set run_id
paramUtil.set("/run_id", uuidv1(), "/", "127.0.0.1")

console.log(`vapor master listening at '${master.uri.href}'`)
