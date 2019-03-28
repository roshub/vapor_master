'use strict'

const serviceUtil = require('./service-util.js')
const topicUtil = require('./topic-util.js')
const paramUtil = require('./param-util.js')
const debug = require('debug')('vapor-master:core-util')
const xmlrpc = require('@roshub/express-xmlrpc')

exports.clean = async (db) => {
  const counts = await Promise.all([
    exports.cleanRosnodes(db),
    serviceUtil.clean(db),
    topicUtil.clean(db),
    paramUtil.clean(db),
  ])

  return counts.reduce((a, b) => a + b, 0)
}

// remove all rosnode docs & resolve to # removed
exports.cleanRosnodes = async (db) => {
  const docs = await db.Vapor.rosnode.find().exec() // get all rosnodes

  const removed = []
  for (const doc of docs) {
    removed.push(doc.remove())
  }
  return removed.length
}

exports.getByPath = async (db, path) => {
  if (!path) {
    return undefined
  }
  let rosnodes;
  debug("getByPath " + path)
  try{
    rosnodes = await db.Vapor.rosnode.find()
      .where('rosnodePath').equals(path).exec()
  }catch (error){
    debug ("getByPath error!");
    debug (error)
  }
  if (rosnodes.length < 1) {
    debug("no rosnode found with path " + path)
    return undefined
  }
  if (rosnodes.length > 1) {
    console.log(`WARNING: multiple rosnodes with path '${path}'`)
  }
  return rosnodes[0]
}

exports.getByUri = async (db, uri) => {
  if (!uri) {
    return undefined
  }
  debug("getByUri " + uri)
  const rosnodes = await db.Vapor.rosnode.find()
    .where('rosnodeUri').equals(uri).exec()

  if (rosnodes.length < 1) {
    debug("no rosnode found with uri " + uri)
    return undefined
  }
  if (rosnodes.length > 1) {
    console.log(`WARNING: multiple rosnodes with uri '${uri}'`)
  }
  return rosnodes[0]
}

// attempt to find a rosnode by either path or uri
exports.getByPathOrUri = async (db, path, uri) => {
  debug(`getbyPathorURI path: ${path} uri: ${uri}`)

  const rosnodeByPath = await exports.getByPath(db, path)
  if (rosnodeByPath) {
    return rosnodeByPath
  }

  const rosnodeByUri = await exports.getByUri(db, uri)
  if (rosnodeByUri) {
    return rosnodeByUri
  }

  return undefined
}

//sends a message to client to shut down node
exports.shutdownNode = async (db, uri, reason) => {
    // get xmlrpc client connection to subscriber uri
    const client = xmlrpc.createClient(uri)

    // publisherUpdate(caller_id, topic, publishers)
    //  -> http://wiki.ros.org/ROS/Slave_API
    client.methodCall('shutdown', ['/', reason],
      (error, value) => {
  
        // on thrown error or failed xmlrpc response log failure to backend
        if (error) {
          debug(error)
          return exports.logFail(db, 
            uri, `error shutting down node at uri '${uri}'`, error)
        }
  
        debug(`Shutdown uri at '${uri}'`)
        return "done"
      }
    )
}

// log method call to vapor master by a rosnode
// if there is no record of rosnode with given path create it
exports.logTouch = async (db, path, uri, ipv4) => {
  debug(`touched rosnode with path '${path}' from ip '${ipv4}'`)

  if (!(path || uri)) {
    throw new Error('need either path or uri to log touch!')
  }

  let rosnode = await exports.getByPathOrUri(db, path, uri)

  if (!rosnode) {
    rosnode = new db.Vapor.rosnode({})
  }
  if (path && path == rosnode.rosnodePath && 
    uri && rosnode.rosnodeUri && uri != rosnode.rosnodeUri){
    debug("Shutting down previous node with duplicate path " + path);
    await exports.shutdownNode(db, rosnode.rosnodeUri, "new node registered with same name")
    rosnode.rosNodeUri = uri;
  }
  if (uri && uri == rosnode.rosnodeUri && path && rosnode.rosnodePath
      && path != rosnode.rosnodePath){
    debug("*WARNING*: Clearing previous node at path "+path+" with same uri...");
    rosnode.rosnodePath = path
  }

  if (path && !rosnode.rosnodePath) { // if path isnt set, set it
    rosnode.rosnodePath = path
  }
  if (uri && !rosnode.rosnodeUri) { // if uri isnt set, set it
    rosnode.rosnodeUri = uri
  }
  if (ipv4) {
    rosnode.touched = { ipv4: ipv4 }
    rosnode.failed = undefined
  } else {
    rosnode.touched = {} // Date.now() set by model
    rosnode.failed = undefined
  }
  try{
    await rosnode.save()
  } catch (error){
    debug("error saving node: ")
    debug(rosnode)
    debug(error)
  }
}

// log failure of rosnode to respond to xmlrpc call to given uri
exports.logFail = async (db, uri, msg, error) => {
  let failmsg = `FAIL: no response from node at uri '${uri}'`
  if (msg) { failmsg += ': ' + msg }
  if (error) {
    debug(failmsg, error)
    failmsg += ': ' + error.toString()
  } else {
    debug(failmsg)
  }

  // try to get record for node at uri, if it doesnt exist create it
  const rosnode = await exports.getByUri(db, uri)
    || new db.Vapor.rosnode({})

  // push fail event to rosnode doc & write to backend
  rosnode.touched = undefined
  rosnode.failed = { msg: failmsg, } // date.now set by model
  await rosnode.save()
}
