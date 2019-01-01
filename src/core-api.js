'use strict'

const xmlrpc = require('@roshub/express-xmlrpc')
const coreUtil = require('./core-util.js')
const topicUtil = require('./topic-util.js')
const serviceUtil = require('./service-util.js')
const debug = require('debug') ('vapor-master:core-api')

// lookupNode(caller_id, node_name)
//   -> (code, statusMessage, URI)
exports.lookupNode = async (req, res) => {
  const [ callerPath, nodePath, ] = req.body.params

  // logTouch adds new rosnodes to collection so if
  //   * callerPath eq nodePath &
  //   * callerPath isnt in rosnode collection yet
  // getByPath & logTouch calls would be in race condition
  // -> await logTouch before calling getByPath
  await coreUtil.logTouch(callerPath, null, req.ip)
  const rosnode = await coreUtil.getByPath(nodePath)

  if (rosnode && rosnode.rosnodeUri) {
    return xmlrpc.sendResult([
      1, // success code
      'found node uri',
      rosnode.rosnodeUri,
    ], req, res)

  } else {
    return xmlrpc.sendResult([
      -1, // rospy master sends error code
      `failed to find uri for node at path '${nodePath}'`,
      '', // rospy master sends empty string
    ], req, res)
  }
}

// shutdown(caller_id, msg)
//   -> (code, statusMessage, ignore)
// use 'function (..) {..}' format to access master context thru 'this'
exports.shutdown = async function (req, res) {
  const [ callerPath, msg, ] = req.body.params

  console.log(`vapor master received shutdown request: ${msg}`)

  await coreUtil.logTouch(callerPath, null, req.ip)

  return xmlrpc.sendResult([
    1, // success code
    `vapor master uri shutting down: '${msg}'`, // status msg
    undefined,
  ], req, res)

  // close server
  this.server.close()
  process.exit()
}

// getUri(caller_id)
//   -> (code, statusMessage, masterURI)
// use 'function (..) {..}' format to access master context thru 'this'
exports.getUri = async function (req, res) {
  const [ callerPath, ] = req.body.params

  await coreUtil.logTouch(callerPath, null, req.ip)

  return xmlrpc.sendResult([
    1, // success code
    'vapor master uri', // status msg
    this.uri.href, // master uri
  ], req, res)
}

// getPid(caller_id)
//   -> (code, statusMessage, serverProcessPID)
exports.getPid = async (req, res) => {
  const [ callerPath, ] = req.body.params

  await coreUtil.logTouch(callerPath, null, req.ip)

  return xmlrpc.sendResult([
    1, // success code
    'vapor master pid', // status msg
    process.pid, // pid
  ], req, res)
}

// getSystemState(caller_id)
//   -> (code, statusMessage, systemState)
//   systemState -> [publishers, subscribers, services]
//   - publishers -> [ [topicPath1, [topic1Pub1...topic1PubN]] ... ]
//   - subscribers -> [ [topicPath1, [topic1Sub1...topic1SubN]] ... ]
//   - services -> [ [servicePath1, [service1Pro1...service1ProN]] ... ]
exports.getSystemState = async (req, res) => {
  const [ callerPath, ] = req.body.params

  const [ , state, ] = await Promise.all([
    coreUtil.logTouch(callerPath, null, req.ip),
    topicUtil.listXubs() // resolves to [pubs, subs]
      .then(serviceUtil.listPros), // takes list & appends services
  ])

  return xmlrpc.sendResult([
    1, // success code
    'vapor master system state', // status msg
    state,
  ], req, res)
}
