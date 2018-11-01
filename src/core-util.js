'use strict'

const db = require('./model-interface.js')
const serviceUtil = require('./service-util.js')
const topicUtil = require('./topic-util.js')
const paramUtil = require('./param-util.js')
const debug = require('debug')('vapor-master:core-util')

exports.clean = async () => {
  const counts = await Promise.all([
    exports.cleanRosnodes(),
    serviceUtil.clean(),
    topicUtil.clean(),
    paramUtil.clean(),
  ])

  return counts.reduce((a, b) => a + b, 0)
}

// remove all rosnode docs & resolve to # removed
exports.cleanRosnodes = async () => {
  const docs = await db.Vapor.rosnode.find().exec() // get all rosnodes

  const removed = []
  for (const doc of docs) {
    removed.push(doc.remove())
  }
  return removed.length
}

exports.getByPath = async (path) => {
  if (!path) {
    return undefined
  }

  const rosnodes = await db.Vapor.rosnode.find()
    .where('rosnodePath').equals(path).exec()

  if (rosnodes.length < 1) {
    return undefined
  }
  if (rosnodes.length > 1) {
    console.log(`WARNING: multiple rosnodes with path '${path}'`)
  }
  return rosnodes[0]
}

exports.getByUri = async (uri) => {
  if (!uri) {
    return undefined
  }

  const rosnodes = await db.Vapor.rosnode.find()
    .where('rosnodeUri').equals(uri).exec()

  if (rosnodes.length < 1) {
    return undefined
  }
  if (rosnodes.length > 1) {
    console.log(`WARNING: multiple rosnodes with uri '${uri}'`)
  }
  return rosnodes[0]
}

// attempt to find a rosnode by either path or uri
exports.getByPathOrUri = async (path, uri) => {

  const rosnodeByPath = await exports.getByPath(path)
  if (rosnodeByPath) {
    return rosnodeByPath
  }

  const rosnodeByUri = await exports.getByUri(uri)
  if (rosnodeByUri) {
    return rosnodeByUri
  }

  return undefined
}

// log method call to vapor master by a rosnode
// if there is no record of rosnode with given path create it
exports.logTouch = async (path, uri, ipv4) => {
  debug(`touched rosnode with path '${path}' from ip '${ipv4}'`)

  if (!(path || uri)) {
    throw new Error('need either path or uri to log touch!')
  }

  let rosnode = await exports.getByPathOrUri(path, uri)

  if (!rosnode) {
    rosnode = new db.Vapor.rosnode({})
  }
  if (path && !rosnode.rosnodePath) { // if path isnt set, set it
    rosnode.rosnodePath = path
  }
  if (uri && !rosnode.rosnodeUri) { // if uri isnt set, set it
    rosnode.rosnodeUri = uri
  }
  if (ipv4) {
    rosnode.touched = { ipv4, }
    rosnode.failed = undefined
  } else {
    rosnode.touched = {} // Date.now() set by model
    rosnode.failed = undefined
  }
  await rosnode.save()
}

// log failure of rosnode to respond to xmlrpc call to given uri
exports.logFail = async (uri, msg, error) => {
  let failmsg = `FAIL: no response from node at uri '${uri}'`
  if (msg) { failmsg += ': ' + msg }
  if (error) {
    console.error(failmsg, error)
    failmsg += ': ' + error.toString()
  } else {
    console.log(failmsg)
  }

  // try to get record for node at uri, if it doesnt exist create it
  const rosnode = await exports.getByUri(uri)
    || new db.Vapor.rosnode({})

  // push fail event to rosnode doc & write to backend
  rosnode.touched = undefined
  rosnode.failed = { msg: failmsg, } // date.now set by model
  await rosnode.save()
}
