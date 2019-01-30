'use strict'

const xmlrpc = require('@roshub/express-xmlrpc')
const coreUtil = require('./core-util')
const paramUtil = require('./param-util')
const debug = require('debug') ('vapor-master:update-util')

// make xmlrpc publisherUpdate call to subscriber uri
exports.updateTopicSub = (db, subUri, topicPath, pubUris) => {

  // get xmlrpc client connection to subscriber uri
  const client = xmlrpc.createClient(subUri)

  // publisherUpdate(caller_id, topic, publishers)
  //  -> http://wiki.ros.org/ROS/Slave_API
  client.methodCall('publisherUpdate', ['/', topicPath, pubUris],
    (error, value) => {

      // on thrown error or failed xmlrpc response log failure to backend
      if (error !== null) {
        return coreUtil.logFail(db, 
          subUri, `error updating topic '${topicPath}'`, error)
      }
      if (value[0] !== 1) { // 1 -> success code
        return coreUtil.logFail(db, 
          subUri, `on topic update subscriber responded: '${value[1]}'`)
      }

      debug(`updated sub '${subUri}' to topic '${topicPath}'`)
      
      // log successful touch to track rosnode lifecycle
      return coreUtil.logTouch(db, null, subUri, '0.0.0.0') // TODO -> get node ip
    }
  )
}

// make call to paramUpdate(caller_id, parameter_key, parameter_value)
exports.updateParamSub = (db, subUri, subPath, keyPath, value) => {
  // get xmlrpc client connection to subscriber uri
  const client = xmlrpc.createClient(subUri)

  // publisherUpdate(caller_id, topic, publishers)
  //  -> http://wiki.ros.org/ROS/Slave_API
  client.methodCall('paramUpdate', ['/', keyPath, value],
    (error, value) => {
      // on thrown error or failed xmlrpc response log failure to backend
      if (error) {
        paramUtil.removeSub(db, keyPath, subPath, subUri);
        const errorMsg = "" + error;
        if (errorMsg.includes("ECONNREFUSED")){
          debug("removed subscription to " + keyPath + " by " + subUri)
          return Promise.resolve()
        }
        
        return coreUtil.logFail(db, 
          subUri, `error updating param '${keyPath}'`, error)
      } else if (value[0] !== 1) { // 1 -> success code
        return coreUtil.logFail(db, 
          subUri, `on param update subscriber responded: '${value[1]}'`)
      }

      debug(`updated subscriber '${subUri}' to param '${keyPath}'`)

      // log successful touch to track rosnode lifecycle
      return coreUtil.logTouch(db, null, subUri, '0.0.0.0') // TODO -> get node ip
    }
  )
}
