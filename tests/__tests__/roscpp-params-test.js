const debug = require('debug')('test:roscpp-client:params')
const Server = require('../../src/server')
const rosnodejs = require('rosnodejs')
const exec = require('await-exec');

let nh;
let server;
let config = __TEST_MASTER_CONFIG__
let ROS_MASTER_URI = __TEST_MASTER_CONFIG__.ROS_MASTER_URI

beforeAll(async ()=>{
   server = new Server(config);
   await server.start();
   nh = await rosnodejs.initNode('/test_rosnodejs_roscpp_client', {rosMasterUri: ROS_MASTER_URI});
})

it('vector test', async ()=>{
    let setParamReply = await nh.setParam('/test/joints', ['one', 'two'])
    expect(setParamReply).toEqual([1, 'param set at \'/test/joints\'', 0])
    let execEnv = process.env
    execEnv.ROS_MASTER_URI = ROS_MASTER_URI
    const output = await exec('rosrun param_tester param_tester_node', 
                        {env: execEnv})
    expect(output.stdout).toEqual('one two ')
})

afterAll(async ()=>{
    await rosnodejs.shutdown();
    await server.stop();
    return 0;
})