'use strict'

const db = require('./model-interface.js')
const debug = require('debug') ('vapor-master:param-util')
const updateUtil = require('./update-util.js')
const topicUtil = require('./topic-util.js')

// remove all param & param sub docs & resolve to # removed
exports.clean = async () => {
  const found = await Promise.all([
    db.Vapor.param.find().exec(), // get all params
    db.Vapor.paramSub.find().exec(), // get all param subscribers
  ])

  const removed = []
  for (const docs of found) {
    for (const doc of docs) {
      removed.push(doc.remove()) // init remove & collect promise
    }
  }

  await Promise.all(removed) // wait for remove operations to resolve
  return removed.length // return # removed
}

// get most recent param at exact key path
// ***not consistent with get()!***
exports.getByKey = (keyPath) => {
  return db.Vapor.param.findOne()
    .sort('-created').where('keyPath').equals(keyPath).exec()
}

// get all params
exports.getAllKeys = async () => {
  const params = await db.Vapor.param.find().exec()

  const keys = {}
  for (const param of params) {
    keys[param.keyPath.slice(0, -1)] = true // drop trailing slash
  }
  return Object.keys(keys)
}

// find all params matching subpath ordered from oldest to newest
exports.getBySubpath = (subpath) => {
  const re = topicUtil.subpathRegEx(subpath)

  return db.Vapor.param.find()
    .sort('created').where('keyPath').regex(re).exec()
}

// find all params matching subpath and load them into a dictionary
// load oldest params first so that newer values overwrite older values
exports.get = async (keyPath) => {

  // assure key path has trailing slash
  const path = (keyPath[keyPath.length - 1] === '/') ? keyPath : keyPath + '/'

  // get path steps without leading & trailing empty spaces from slashes
  const steps = path.split('/').slice(1, -1)

  // getBySubpath delivers params sorted oldest -> newest
  // build param tree by assigning params to dict in order so that newer
  // params clobber older params
  const params = await exports.getBySubpath(path)
  const tree = {}
  for (const param of params) {

    // handle special case of root path query ('/') which gives 0 steps
    // * for root query keep all steps of parameter key path (except slashes)
    // * for other queries start at last step of query path so leaf values
    //   will be captured properly
    const keys = (steps.length === 0) ? param.keyPath.split('/').slice(1, -1)
      : param.keyPath.split('/').slice(steps.length, -1)

    let subtree = tree // start subtree at top level
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]

      // assign value to last key
      if (i === keys.length - 1) {
        subtree[key] = param.paramValue()

      // start at last step of query path (to capture top level leaf values)
      // iteratively fetch next level in subtree
      // * build it if its not there
      // * if there is a leaf value clobber it with an object for subtree
      } else {
        if (!(key in subtree) || typeof subtree[key] !== 'object') {
          subtree[key] = {}
        }
        subtree = subtree[key]
      }
    }
  }

  // unless query path was '/' value is keyed with last step of query
  return (steps.length === 0) ? tree : tree[steps[steps.length - 1]]
}

// create new param sub & write to backend -> returns promise
exports.createSub = (keyPath, subPath, subUri, subIP) => {
  return db.Vapor.paramSub.create({
    keyPath: keyPath,
    subscriberPath: subPath,
    subscriberUri: subUri,
    subscriberIpv4: subIP
  })
}

// resolves to list of deleted xubs
exports.removeSub = async (keyPath, subPath, subUri) => {
  const subs = await db.Vapor.paramSub.find()
    .where('keyPath').equals(keyPath)
    .where('subscriberPath').equals(subPath)
    .where('subscriberUri').equals(subUri).exec()

  const removed = []
  for (const sub of subs) {
    removed.push(sub.remove()) // init parallel backend removal of matches
  }
  if (removed.length > 1) {
    console.log(
      `WARNING: removed multiple subs at '${subPath}' for param '${keyPath}'`)
  }

  return Promise.all(removed) // resolve parallel backend removes
}

exports.removeByKey = async (keyPath) => {
  const params = await db.Vapor.param.find()
    .where('keyPath').equals(keyPath).exec()

  const removed = []
  for (const param of params) {
    removed.push(param.remove()) // init parallel backend removal of matches
  }
  if (removed.length > 1) {
    console.log(`WARNING: removed multiple params at '${keyPath}'`)
  }
  return Promise.all(removed) // resolve parallel backend removes
}

exports.setByKey = (keyPath, value, creatorPath, creatorIpv4) => {
  const valueType = (value === null) ? 'null' : typeof value

  switch (valueType) {
    case 'string':
      if (value == ""){
        debug("stringValue is equal to an empty string!")
      }
      return db.Vapor.param.create({
        keyPath: keyPath,
        valueType: valueType,
        stringValue: value,
        creatorPath: creatorPath,
        creatorIpv4: creatorIpv4,
      })
    case 'number':
      return db.Vapor.param.create({
        keyPath: keyPath,
        valueType: valueType,
        numberValue: value,
        creatorPath: creatorPath,
        creatorIpv4: creatorIpv4,
      })
    case 'boolean':
      return db.Vapor.param.create({
        keyPath: keyPath,
        valueType: valueType,
        booleanValue: value,
        creatorPath: creatorPath,
        creatorIpv4: creatorIpv4,
      })
  }
  return db.Vapor.param.create({ // null value only has valuetype set
    keyPath: keyPath,
    valueType: valueType,
    creatorPath: creatorPath,
    creatorIpv4: creatorIpv4,
  })
}

// recursively sets value at path until leaf (!object) value reached
// * on success makes xmlrpc calls to update any subscribers
// * backend stores doc for each key path / leaf value pair
// * setting a map with multiple k/v pairs generates a doc for each value
//   - set('/foot/left/sock', 'green', ..) &
//   - set('/foot/left', {sock: 'green'}, ..)
//   produce identical results -- a single new backend doc
//   -> Param{ keyPath: '/foot/left/sock', value: 'green', ..}
exports.set = async (keyPath, value, creatorPath, creatorIpv4) => {

  // assure key path has trailing slash
  const path = (keyPath[keyPath.length - 1] === '/') ? keyPath : keyPath + '/'

  // null, strings, numbers & booleans can be leaf values
  if (value === null
      || typeof value === 'string'
      || typeof value === 'number'
      || typeof value === 'boolean') {

    await exports.setByKey(path, value, creatorPath, creatorIpv4)

    setImmediate(() => { // on success async update subs
      exports.updateSubs(path, value)
    })

  // for object make recursive call for each [subkey, subvalue] pair
  } else if (typeof value === 'object') {

    // make recursive call for each subkey & await completion in parallel
    const calls = []
    for (const [ subkey, subvalue, ] of Object.entries(value)) {
      calls.push(
        exports.set(path + subkey, subvalue, creatorPath, creatorIpv4))
    }
    await Promise.all(calls)

    // on success async update subs
    setImmediate(() => {
      exports.updateSubs(path, value)
    })

  } else {
    throw new Error(
      `cant set param of type '${typeof value}': '${value.toString()}'`)
  }
}

// check for any subscribers to key path & update
// call is asynchronous dont need to wait for promises to resolve
exports.updateSubs = async (keyPath, value) => {
  const subs = await exports.getSubs(keyPath)

  for (const sub of subs) {
    updateUtil.updateParamSub(sub.subscriberUri, keyPath, value)
  }
}

// get subscribers to key path
exports.getSubs = (keyPath) => {
  return db.Vapor.paramSub.find()
    .where('keyPath').equals(keyPath).exec()
}
