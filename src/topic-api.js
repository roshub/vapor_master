'use strict'

const xmlrpc = require('@roshub/express-xmlrpc')
const coreUtil = require('./core-util.js')
const topicUtil = require('./topic-util.js')
const debug = require('debug') ('vapor-master:topic-api')

// registerSubscriber(caller_id, topic, topicType, caller_api)
//   -> (code, statusMessage, publishers)
exports.registerSubscriber = async (req, res) => {
  const [ callerPath, topicPath, topicType, callerUri, ] = req.body.params

  const [ , , , pubUris, ] = await Promise.all([

    // logTouch creates rosnode/topic if they dont exist
    coreUtil.logTouch(callerPath, callerUri, req.ip),

    // in rospy master first sub/pub to touch topic path sets type
    // seems to ignore mismatch tho?!
    topicUtil.logTouch(topicPath, topicType, req.ip),

    // create subscriber & get list of publisher uris
    topicUtil.createXub('sub', topicPath, callerPath, callerUri, req.ip),
    topicUtil.getXubUris('pub', topicPath),
  ])

  // rospy master topic subscription always succeeds
  return xmlrpc.sendResult([
    1, // success code
    `subscribed node at '${callerPath}' to topic at '${topicPath}'`,
    pubUris, // potentially empty list
  ], req, res)
}

// unregisterSubscriber(caller_id, topic, caller_api)
//   -> (code, statusMessage, numUnsubscribed)
exports.unregisterSubscriber = async (req, res) => {
  const [ callerPath, topicPath, callerUri, ] = req.body.params

  const [ , , removed, ] = await Promise.all([
    coreUtil.logTouch(callerPath, callerUri, req.ip),
    topicUtil.logTouch(topicPath, null, req.ip),
    topicUtil.removeXub('sub', callerUri, topicPath), // resolves to list
  ])

  if (removed.length > 0) {
    return xmlrpc.sendResult([
      1, // success code
      `'${callerUri}' unsubscribed from topic '${topicPath}'`,
      1,
    ], req, res)

    // rospy master *sends success code but value 0* if uri isnt subscribed
  } else {
    return xmlrpc.sendResult([
      1, // success code
      `'${callerUri}' not subscribed to topic '${topicPath}'`,
      0, // follow rospy master
    ], req, res)
  }
}

// registerPublisher(caller_id, topic, topicType, caller_api)
//   -> (code, statusMessage, subscriberApis)
exports.registerPublisher = async (req, res) => {
  const [ callerPath, topicPath, topicType, callerUri, ] = req.body.params

  const [ , , , subUris, ] = await Promise.all([

    // logTouch creates rosnode/topic if they dont exist
    coreUtil.logTouch(callerPath, callerUri, req.ip),

    // in rospy master first sub/pub to touch topic path sets type
    // seems to ignore mismatch tho?!
    topicUtil.logTouch(topicPath, topicType, req.ip),

    // create publisher & get list of subscriber uris
    topicUtil.createXub('pub', topicPath, callerPath, callerUri, req.ip),
    topicUtil.getXubUris('sub', topicPath),
  ])

  // update subscriber nodes asynchronously with list of pub uris
  setImmediate(() => {
    topicUtil.updateSubs(topicPath, subUris)
  })

  // rospy master topic publisher registration always succeeds
  return xmlrpc.sendResult([
    1, // success code
    `'${callerUri}' publishing to topic at '${topicPath}'`,
    subUris,
  ], req, res)
}

// unregisterPublisher(caller_id, topic, caller_api)
//   -> (code, statusMessage, numUnregistered)
exports.unregisterPublisher = async (req, res) => {
  const [ callerPath, topicPath, callerUri, ] = req.body.params

  const [ , , removed, ] = await Promise.all([
    coreUtil.logTouch(callerPath, callerUri, req.ip),
    topicUtil.logTouch(topicPath, null, req.ip),
    topicUtil.removeXub('pub', callerUri, topicPath), // resolves to list
  ])

  if (removed.length > 0) {
    return xmlrpc.sendResult([
      1, // success code
      `'${callerUri}' unregistered as publisher for topic '${topicPath}'`,
      1,
    ], req, res)

    // rospy master *sends success code but value 0* if uri isnt subscribed
  } else {
    return xmlrpc.sendResult([
      1, // success code
      `'${callerUri}' not registered publisher for topic '${topicPath}'`,
      0, // follow rospy master
    ], req, res)
  }
}

// getPublishedTopics(caller_id, subgraph)
//   -> (code, statusMessage, [ [topic1, type1]...[topicN, typeN] ])
// TODO -> full rospy master subpath behavior hasnt been implemented?
exports.getPublishedTopics = async (req, res) => {
  const [ callerPath, subpath, ] = req.body.params

  const [ , topicPairs, ] = await Promise.all([
    coreUtil.logTouch(callerPath, null, req.ip),

    // getPubPairs resolves to -> [[topicPath, msgType], ..]
    // for topics that have at least one publisher registered
    topicUtil.getPubPairs(subpath),
  ])

  return xmlrpc.sendResult([
    1, // success code
    'currently published topics',
    topicPairs,
  ], req, res)
}

// getTopicTypes(caller_id)
//   -> (code, statusMessage, topicTypes)
//   topicTypes is a list of [topicName, topicType] pairs
exports.getTopicTypes = async (req, res) => {
  const [ callerPath, ] = req.body.params

  const [ , topicPairs, ] = await Promise.all([
    coreUtil.logTouch(callerPath, null, req.ip),
    topicUtil.getAllPairs(), // resolves to list
  ])

  return xmlrpc.sendResult([
    1, // success code
    'current topic types',
    topicPairs,
  ], req, res)
}
