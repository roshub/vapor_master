'use strict'

const debug = require('debug') ('vapor-master:service-util')

// remove all service provider docs & resolve to # removed
exports.clean = async (db) => {
  const found = await db.Vapor.servicePro.find().exec() // get all providers

  const removed = []
  for (const doc of found) {
    removed.push(doc.remove()) // init remove & collect promise
  }

  await Promise.all(removed) // wait for remove operations to resolve
  return removed.length // return # removed
}
exports.getProsFromNodePath = async(db, nodePath) =>{
  const Pros = await db.Vapor.servicePro.find().where('providerPath').equals(nodePath).exec()
  return Pros;
}

// takes (optional) list and appends sublist of services
// returns promise that resolves to [(..listcontents,) services]
// where services -> [ [servicePath1, [service1Pro1...service1ProN]] ... ]
exports.listPros = async (db, list = []) => {
  const servicePros = await db.Vapor.servicePro.find().exec()

  // loop thru providers and add to map by service path
  const map = {}
  for (const pro of servicePros) {
    if (!(pro.servicePath in map)) { map[pro.servicePath] = [] }
    map[pro.servicePath].push(pro.providerPath)
  }

  // convert maps to lists, push into passed list & resolve
  list.push(Object.entries(map))
  return Promise.resolve(list)
}

// returns promise resolving to new service provider
exports.createPro = async (db, servicePath, serviceUri, proPath, proUri, proIpv4) => {
  const pros = await db.Vapor.servicePro.find().exec()
  let matches = pros.filter((pro,i,arr)=>{
    if (pro.servicePath == servicePath &&
        pro.serviceUri == serviceUri &&
        pro.providerPath == proPath &&
        pro.providerUri == proUri &&
        pro.providerIpv4 == proIpv4){
      return true
    }
    return false;
  })

  if (matches.length > 0){
    return matches[0];
  }
  return db.Vapor.servicePro.create({
    servicePath: servicePath,
    serviceUri: serviceUri,
    providerPath: proPath,
    providerUri: proUri,
    providerIpv4: proIpv4,
  })
}

// resolves to list of deleted service providers
exports.removePro = async (db, servicePath, serviceUri) => {
  const pros = await db.Vapor.servicePro.find()
    .where('servicePath').equals(servicePath)
    .where('serviceUri').equals(serviceUri).exec()

  const removed = []
  for (const pro of pros) {
    removed.push(pro.remove())
  }
  if (removed.length > 1) {
    console.log(
      `WARNING: removed multiple service providers for ${servicePath}`)
  }
  return Promise.all(removed)
}

// return promise that resolves to most recent provider at service path
exports.getPro = (db, servicePath) => {
  return db.Vapor.servicePro.findOne()
    .sort('-created').where('servicePath').equals(servicePath).exec()
}
