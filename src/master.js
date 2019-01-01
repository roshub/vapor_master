'use strict'

const URL = require('url-parse')
const xmlrpc = require('@roshub/express-xmlrpc')
const coreUtil = require('./core-util.js')
const debug = require('debug')('vapor-master:master')

// singleton ros master server express router
const master = {}

// ros master api
// express-xmlrpc takes an api object with a set of handler functions
// * keys are xmlrpc method names
// * args are express req(uest), res(ponse), next
// * middleware parses req.body.method & req.body.params from body
// * xmlrpc.serializeResponse() generates xml to pass to express res.send()
master.api = Object.assign({},
  require('./core-api.js'),
  require('./service-api.js'),
  require('./topic-api.js'),
  require('./param-api.js'))

// call to update the value getUri() will return
// parses uri into node url object
master.uri = undefined

master.setUri = (uri) => {
  master.uri = new URL(uri)
}

// delete *all records* from backend
master.cleanDb = async () => {
  const count = await coreUtil.clean()
  console.log(`cleaning! ${count} records removed from db`)
}

// error handler for xmlrpc router catches errors & sends ros error message
master.onError = (error, req, res, next) => {
  console.error(`error handling method call: '${req.body.method}':`, error)

  // send ros error message
  res.send(xmlrpc.serializeResponse([
    -1, // error code
    `error handling method call '${req.body.method}'`,
    undefined,
  ]))

  next(error)
}

// miss handler for xmlrpc router sends ros error message for unknown methods
master.onMiss = (req, res) => {
  console.error(`fail! unrecognized method call: '${req.body.method}'`)

  // send ros error message
  res.send(xmlrpc.serializeResponse([
    -1, // error code
    `unrecognized method call '${req.body.method}'`,
    undefined,
  ]))
}

// export singleton ros master server
module.exports = master
