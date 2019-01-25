const path = require('path');
const fs = require('fs');
const MongodbMemoryServer = require('mongodb-memory-server');
const globalConfigPath = path.join(__dirname, 'globalConfig.json');

const debug = require('debug')('roshub.mongo-mock-setup')

const mongod = new MongodbMemoryServer.default({
  instance: {
    port: 42771,
    dbName: 'jest'
  },
  binary: {
    version: '3.6.3'
  }
})

// let restServer = undefined

module.exports = async function() {

  debug('== setup.js ()')

  let mongoUri = await mongod.getConnectionString()

  global.__MONGODB__ = mongod;
  global.__TEST_CONFIG__ = {
    mongoDBName: 'jest',
    mongoUri: mongoUri,
  }

  debug('== setup.js () done')
};
