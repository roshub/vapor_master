'use strict'

const xmlrpc = require('@roshub/express-xmlrpc')
const coreUtil = require('./core-util')
const debug = require('debug') ('vapor-master:update-util')

// make xmlrpc publisherUpdate call to subscriber uri
exports.updateTopicSub = (subUri, topicPath, pubUris) => {

  // get xmlrpc client connection to subscriber uri
  const client = xmlrpc.createClient(subUri)

  // publisherUpdate(caller_id, topic, publishers)
  //  -> http://wiki.ros.org/ROS/Slave_API
  client.methodCall('publisherUpdate', ['/', topicPath, pubUris],
    (error, value) => {

      // on thrown error or failed xmlrpc response log failure to backend
      if (error !== null) {
        return coreUtil.logFail(
          subUri, `error updating topic '${topicPath}'`, error)
      }
      if (value[0] !== 1) { // 1 -> success code
        return coreUtil.logFail(
          subUri, `on topic update subscriber responded: '${value[1]}'`)
      }

      debug(`updated sub '${subUri}' to topic '${topicPath}'`)

      // log successful touch to track rosnode lifecycle
      return coreUtil.logTouch(null, subUri, '0.0.0.0') // TODO -> get node ip
    }
  )
}

// make call to paramUpdate(caller_id, parameter_key, parameter_value)
exports.updateParamSub = (subUri, keyPath, value) => {

  // get xmlrpc client connection to subscriber uri
  const client = xmlrpc.createClient(subUri)

  // publisherUpdate(caller_id, topic, publishers)
  //  -> http://wiki.ros.org/ROS/Slave_API
  client.methodCall('paramUpdate', ['/', keyPath, value],
    (error, value) => {

      // on thrown error or failed xmlrpc response log failure to backend
      if (error !== null) {
        return coreUtil.logFail(
          subUri, `error updating param '${keyPath}'`, error)
      }
      if (value[0] !== 1) { // 1 -> success code
        return coreUtil.logFail(
          subUri, `on param update subscriber responded: '${value[1]}'`)
      }

      debug(`updated subscriber '${subUri}' to param '${keyPath}'`)

      // log successful touch to track rosnode lifecycle
      return coreUtil.logTouch(null, subUri, '0.0.0.0') // TODO -> get node ip
    }
  )
}
