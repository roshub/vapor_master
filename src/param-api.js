'use strict'

const xmlrpc = require('@roshub/express-xmlrpc')
const coreUtil = require('./core-util.js')
const paramUtil = require('./param-util.js')
const debug = require('debug') ('vapor-master:param-api')

// hasParam(caller_id, key)
//   -> (code, statusMessage, hasParam)
exports.hasParam = async (req, res, next) => {
  const [callerPath, keyPath] = req.body.params

  const [, param] = await Promise.all([
    //coreUtil.logTouch(callerPath, null, req.ip),
    paramUtil.get(keyPath),
  ])

  // test for leaf param (null | string | number | boolean)
  const has = (param === null
               || typeof param === 'string'
               || typeof param === 'number'
               || typeof param === 'boolean')

  debug(`hasParam('${keyPath}') -> ${has}`)

  return xmlrpc.sendResult([
    1, // success code
    `tested for param at '${keyPath}'`,
    has,
  ], req, res)
}

// getParam(caller_id, key)
//   -> (code, statusMessage, parameterValue)
exports.getParam = async (req, res) => {
  const [callerPath, keyPath] = req.body.params

  const [, param] = await Promise.all([
    //coreUtil.logTouch(callerPath, null, req.ip),
    paramUtil.get(keyPath),
  ])

  // if no param found send error response (to follow rospy master)
  if (param === undefined) {
    debug(`getParam('${keyPath}') -> [ERROR: not found]`)

    return xmlrpc.sendResult([
      -1, // error code
      `no param found at '${keyPath}'`,
      0, // follows rospy master
    ], req, res)

  } else {
    debug(`getParam('${keyPath}') -> ${param}`)

    return xmlrpc.sendResult([
      1, // success code
      `param at '${keyPath}'`,
      param,
    ], req, res)
  }
}

// setParam(caller_id, key, value)
//   -> (code, statusMessage, ignore)
exports.setParam = async (req, res) => {
  const [callerPath, keyPath, value] = req.body.params
  debug(`callerpath ${callerPath}  keyPath ${keyPath} value ${value}`)
  await Promise.all([
    //coreUtil.logTouch(callerPath, null, req.ip),
    paramUtil.set(keyPath, value, callerPath, req.ip), // also updates subs
  ])
  debug("goodbye", keyPath)
  return xmlrpc.sendResult([
    1, // success code
    `param set at '${keyPath}'`,
    0, // follows rospy master
  ], req, res)
}

// deleteParam(caller_id, key)
//   -> (code, statusMessage, ignore)
exports.deleteParam = async (req, res) => {
  const [callerPath, keyPath] = req.body.params

  const [, removed] = await Promise.all([
    //coreUtil.logTouch(callerPath, null, req.ip),
    paramUtil.removeByKey(keyPath),
  ])

  // rospy implementation returns 1 on successful deletion & -1 if not set
  if (removed.length > 0) {
    return xmlrpc.sendResult([
      1, // success code
      `param at '${keyPath}' deleted`,
      0,
    ], req, res)
  } else {
    return xmlrpc.sendResult([
      -1, // error code
      `param at '${keyPath}' not set`,
      0,
    ], req, res)
  }
}

// searchParam(caller_id, key)
//   -> (code, statusMessage, foundKey)
exports.searchParam = async (req, res) => {
  const [callerPath] = req.body.params

  //coreUtil.logTouch(callerPath, null, req.ip)

  throw new Error('searchParam not implemented')
}

// subscribeParam(caller_id, caller_api, key)
//   -> (code, statusMessage, parameterValue)
exports.subscribeParam = async (req, res) => {
  const [callerPath, callerUri, keyPath] = req.body.params

  const [,, param] = await Promise.all([
    //coreUtil.logTouch(callerPath, callerUri, req.ip),
    paramUtil.createSub(keyPath, callerPath, callerUri, req.ip),
    paramUtil.get(keyPath),
  ])

  // return empty dict if no value found for param
  // spec -> http://wiki.ros.org/ROS/Parameter%20Server%20API
  const value = param ? param.value : {}

  return xmlrpc.sendResult([
    1, // success code
    `subscribed to param ${keyPath}`,
    value,
  ], req, res)
}

// unsubscribeParam(caller_id, caller_api, key)
//   -> (code, statusMessage, numUnsubscribed)
exports.unsubscribeParam = async (req, res) => {
  const [callerPath, callerUri, keyPath] = req.body.params

  const [, removed] = await Promise.all([
    //coreUtil.logTouch(callerPath, callerUri, req.ip),
    paramUtil.removeSub(keyPath, callerPath, callerUri),
  ])

  return xmlrpc.sendResult([
    1, // success code
    `node '${callerPath}' unsubscribed from param ${keyPath}`,
    removed.length, // rospy master always returns 1 !?
  ], req, res)
}

// getParamNames(caller_id)
//   -> (code, statusMessage, parameterNameList)
exports.getParamNames = async (req, res) => {
  const [callerPath] = req.body.params

  const [, keys] = await Promise.all([
    //coreUtil.logTouch(callerPath, null, req.ip),
    paramUtil.getAllKeys(),
  ])

  return xmlrpc.sendResult([
    1, // success code
    'all param names',
    keys,
  ], req, res)
}
