const NodeEnvironment = require('jest-environment-node');
const path = require('path');
const fs = require('fs');
const debug = require('debug')('vapor-master.mongo-mock-env')

module.exports = class MongoEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config)
    debug('== env.js constructor()')
  }

  async setup() {
    debug('== env.js setup()')
    debug('Setup MongoDB Test Environment');
    await super.setup();
  }

  async teardown() {
    debug('== env.js teardown()')
    debug('Teardown MongoDB Test Environment');

    return super.teardown()
  }

  runScript(script) {
    //debug('== env.js runScript()')
    return super.runScript(script);
  }
}
