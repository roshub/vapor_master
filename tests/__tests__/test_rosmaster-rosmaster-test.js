const debug = require('debug')('test:test_rosmaster:rosmaster')
const Server = require('../../src/server')
const rosnodejs = require('rosnodejs')
const exec = require('await-exec');
const parseRosTestOutput = require('../rosTestParser.js').parseRosTestOutput
const { spawn } = require('child_process')

let nh;
let server;
let config = __TEST_MASTER_CONFIG__
let ROS_MASTER_URI = __TEST_MASTER_CONFIG__.ROS_MASTER_URI
let execEnv = process.env
execEnv.ROS_MASTER_URI = ROS_MASTER_URI
execEnv.ROSCONSOLE_STDOUT_LINE_BUFFERED = 1

beforeAll(async ()=>{
   server = new Server(config);
   await server.start();
   nh = await rosnodejs.initNode('/test_rosmaster', {rosMasterUri: ROS_MASTER_URI});
})

it('test_rosmaster rosmaster.test', async ()=>{
    let setParamReply = await nh.setParam('/test/joints', ['one', 'two'])
    expect(setParamReply).toEqual([1, 'param set at \'/test/joints\'', 0])
    const output = await exec('rostest -r test_rosmaster rosmaster.test', 
                        {env: execEnv})
    const testOutput = parseRosTestOutput(output.stdout);
    if (testOutput.summary.result != "success"){
        
    }
})

afterAll(async ()=>{
    await rosnodejs.shutdown();
    await server.stop();
    return 0;
})