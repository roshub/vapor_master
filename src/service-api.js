'use strict'

const xmlrpc = require('@roshub/express-xmlrpc')
const coreUtil = require('./core-util.js')
const serviceUtil = require('./service-util.js')
const debug = require('debug') ('vapor-master:service-api')

// registerService(caller_id, service, service_api, caller_api)
//   -> (code, statusMessage, ignore)
exports.registerService = async function(req, res) {
  const [callerPath, servicePath, serviceUri, callerUri] = req.body.params

  await coreUtil.logTouch(this.db, callerPath, callerUri, req.ip) // creates node if new
  await serviceUtil.createPro(this.db, 
      servicePath, serviceUri, callerPath, callerUri, req.ip)

  // if create provider call didnt throw error registration succeeded
  return xmlrpc.sendResult([
    1, // success code
    `node '${callerPath}' providing service '${servicePath}'`,
    1, // rospy master returns 1 on success
  ], req, res)
}

// unregisterService(caller_id, service, service_api, caller_api)
//   -> (code, statusMessage, numUnregistered)
exports.unregisterService = async function(req, res) {
  const [callerPath, servicePath, serviceUri] = req.body.params
  let path = "/"
  if (!callerPath || !servicePath || !serviceUri){
    if (callerPath){
      path = callerPath
    }
    coreUtil.logTouch(this.db, path, null, req.ip)
    return xmlrpc.sendResult([
      -1, // error code
      `Error: bad call arity`,
      0,
    ], req, res)
  }
  await coreUtil.logTouch(this.db, callerPath, null, req.ip)

    // removePro resolves to list of removed service providers
    //
    // rospy master does something more complex also referencing
    // the caller path, but there should only be one provider at a given uri
  const removed  = await serviceUtil.removePro(this.db, servicePath, serviceUri)

  if (removed.length > 0) {
    return xmlrpc.sendResult([
      1, // success code
      `'${serviceUri}' unregistered from service '${servicePath}'`,
      1,
    ], req, res)

  // rospy master *sends success code but value 0* if uri isnt registered
  } else {
    return xmlrpc.sendResult([
      1, // success code
      `'${serviceUri}' not registered for service '${servicePath}'`,
      0, // follow rospy master
    ], req, res)
  }
}

// lookupService(caller_id, service)
//   -> (code, statusMessage, serviceUrl)
exports.lookupService = async function(req, res) {
  const [callerPath, servicePath] = req.body.params

  const [, pro] = await Promise.all([
    coreUtil.logTouch(this.db, callerPath, null, req.ip),

    // getPro resolves to most recently registered service provider at path
    serviceUtil.getPro(this.db, servicePath),
  ])

  // if a service provider was found return its service uri
  if (pro) {
    return xmlrpc.sendResult([
      1, // success code
      `service '${servicePath}' provided by node '${pro.providerPath}'`,
      pro.serviceUri,
    ], req, res)

  // otherwise return error code
  } else {
    return xmlrpc.sendResult([
      -1, // error code
      `no provider for service '${servicePath}'`,
      '', // follow rospy master
    ], req, res)
  }
}
