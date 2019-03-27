'use strict'

const xmlrpc = require('@roshub/express-xmlrpc')
const coreUtil = require('./core-util.js')
const paramUtil = require('./param-util.js')
const debug = require('debug') ('vapor-master:param-api')

// hasParam(caller_id, key)
//   -> (code, statusMessage, hasParam)
exports.hasParam = async function(req, res, next) {
  const [callerPath, keyPath] = req.body.params

  // await coreUtil.logTouch(this.db, callerPath, null, req.ip)
  const param = await paramUtil.get(this.db, callerPath, keyPath)
  debug("HasParam gotten ")
  debug(param)
  // test for leaf param (null | string | number | boolean | array)
  let has = (param === null
               || typeof param === 'string'
               || typeof param === 'number'
               || typeof param === 'boolean'
               || Array.isArray(param))

  if (typeof param === "object"){
    has = true;
  }
  debug(`hasParam('${keyPath}') -> ${has}`)

  return xmlrpc.sendResult([
    1, // success code
    `tested for param at '${keyPath}'`,
    has,
  ], req, res)
}

// getParam(caller_id, key)
//   -> (code, statusMessage, parameterValue)
exports.getParam = async function(req, res) {
  const [callerPath, keyPath] = req.body.params

  debug(keyPath)

  // await coreUtil.logTouch(this.db, callerPath, null, req.ip)
  const param = await paramUtil.get(this.db, callerPath, keyPath)

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
exports.setParam = async function(req, res) {
  const [callerPath, keyPath, value] = req.body.params
  debug(`setParam callerpath ${callerPath}  keyPath ${keyPath} value ${value}`)

  debug(req.body.params)

  //await coreUtil.logTouch(this.db, callerPath, null, req.ip)
  await paramUtil.set(this.db, keyPath, value, callerPath, req.ip) // also updates subs


  debug("goodbye", keyPath)

  return xmlrpc.sendResult([
    1, // success code
    `param set at '${keyPath}'`,
    0, // follows rospy master
  ], req, res)
}

// deleteParam(caller_id, key)
//   -> (code, statusMessage, ignore)
exports.deleteParam = async function(req, res) {
  const [callerPath, keyPath] = req.body.params

  // await coreUtil.logTouch(this.db, callerPath, null, req.ip)
  const removed = await paramUtil.removeByKey(this.db, keyPath)

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
exports.searchParam = async function(req, res) {
  const [callerPath] = req.body.params

  //coreUtil.logTouch(this.db, callerPath, null, req.ip)

  throw new Error('searchParam not implemented')
}

// subscribeParam(caller_id, caller_api, key)
//   -> (code, statusMessage, parameterValue)
exports.subscribeParam = async function(req, res) {
  const [callerPath, callerUri, keyPath] = req.body.params
  debug(`${callerPath} is subscribing to ${keyPath}`)

  // await coreUtil.logTouch(this.db, callerPath, null, req.ip)
  await paramUtil.createSub(this.db, keyPath, callerPath, callerUri, req.ip)
  const param = await paramUtil.get(this.db, callerPath, keyPath)

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
exports.unsubscribeParam = async function(req, res) {
  const [callerPath, callerUri, keyPath] = req.body.params

  
  paramUtil.removeSub(this.db, keyPath, callerPath, callerUri)
  const removed = await paramUtil.get(this.db, callerPath, keyPath)

  

  return xmlrpc.sendResult([
    1, // success code
    `node '${callerPath}' unsubscribed from param ${keyPath}`,
    removed.length, // rospy master always returns 1 !?
  ], req, res)
}

// getParamNames(caller_id)
//   -> (code, statusMessage, parameterNameList)
exports.getParamNames = async function(req, res) {
  const [callerPath] = req.body.params

  //await coreUtil.logTouch(this.db, callerPath, null, req.ip)
  const keys = await paramUtil.getAllKeys(this.db, )

  return xmlrpc.sendResult([
    1, // success code
    'all param names',
    keys,
  ], req, res)
}
