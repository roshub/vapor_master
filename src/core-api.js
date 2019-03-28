'use strict'

const xmlrpc = require('@roshub/express-xmlrpc')
const coreUtil = require('./core-util.js')
const topicUtil = require('./topic-util.js')
const serviceUtil = require('./service-util.js')
const debug = require('debug') ('vapor-master:core-api')

// lookupNode(caller_id, node_name)
//   -> (code, statusMessage, URI)
exports.lookupNode = async function(req, res) {
  const [ callerPath, nodePath, ] = req.body.params

  // logTouch adds new rosnodes to collection so if
  //   * callerPath eq nodePath &
  //   * callerPath isnt in rosnode collection yet
  // getByPath & logTouch calls would be in race condition
  // -> await logTouch before calling getByPath
  await coreUtil.logTouch(this.db, callerPath, null, req.ip)
  debug("looking up node at path " + nodePath)
  const rosnode = await coreUtil.getByPath(this.db, nodePath)

  if (rosnode && rosnode.rosnodeUri) {
    const topics = await topicUtil.getTopicXubsFromNodePath(this.db, rosnode.rosnodePath)
    const services = await serviceUtil.getProsFromNodePath(this.db, rosnode.rosnodePath)
    if (topics.length > 0 || services.length > 0){
      debug("found rosnode at path " + nodePath)
      return xmlrpc.sendResult([
        1, // success code
        'found node uri',
        rosnode.rosnodeUri,
      ], req, res)  
    }
  } 
  debug("Could not find active rosnode at path " + nodePath)
  return xmlrpc.sendResult([
    -1, // rospy master sends error code
    `failed to find uri for node at path '${nodePath}'`,
    '', // rospy master sends empty string
  ], req, res)
}

// shutdown(caller_id, msg)
//   -> (code, statusMessage, ignore)
// use 'function (..) {..}' format to access master context thru 'this'
exports.shutdown = async function (req, res) {
  const [ callerPath, msg, ] = req.body.params
  console.log(`vapor master received shutdown request: ${msg}`)

  await coreUtil.logTouch(this.db, callerPath, null, req.ip)
  
  if (this.config['no-shutdown'] || this.config['shutdown'] === false){
    debug("vapor master refusing to shutdown")
    return xmlrpc.sendResult([
      -1, // error
      `vapor master refusing to shutdown due to configuration override`, // status msg
      undefined,
    ], req, res)  
  }

  xmlrpc.sendResult([
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

  await coreUtil.logTouch(this.db, callerPath, null, req.ip)

  return xmlrpc.sendResult([
    1, // success code
    'vapor master uri', // status msg
    this.uri.href, // master uri
  ], req, res)
}

// getPid(caller_id)
//   -> (code, statusMessage, serverProcessPID)
exports.getPid = async function(req, res) {
  const [ callerPath, ] = req.body.params

  await coreUtil.logTouch(this.db, callerPath, null, req.ip)

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
exports.getSystemState = async function(req, res) {
  const [ callerPath, ] = req.body.params

  const [ , state, ] = await Promise.all([
    coreUtil.logTouch(this.db, callerPath, null, req.ip),
    topicUtil.listXubs(this.db ) // resolves to [pubs, subs]
      .then((data)=>{
        return serviceUtil.listPros(this.db, data);
      }), // takes list & appends services
  ])

  return xmlrpc.sendResult([
    1, // success code
    'vapor master system state', // status msg
    state,
  ], req, res)
}
