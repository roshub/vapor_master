const NodeEnvironment = require('jest-environment-node');
const path = require('path');
const fs = require('fs');
const globalConfigPath = path.join(__dirname, 'globalConfig.json');
const debug = require('debug')('vapor-master.mongo-mock-env')

//const DbModel = require('../src/model/db')

module.exports = class MongoEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config)
    debug('== env.js constructor()')
  }

  async setup() {
    debug('== env.js setup()')
    debug('Setup MongoDB Test Environment');

    this.global.__TEST_CONFIG__ = JSON.parse(fs.readFileSync(globalConfigPath, 'utf-8'));

    debug('env-test-config', this.global.__TEST_CONFIG__)
    //this.global.__DB__ = new DbModel(this.global.__TEST_CONFIG__.mongoUri)
    //await this.global.__DB__.connect()

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
