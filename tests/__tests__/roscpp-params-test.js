const debug = require('debug')('test.roscpp-client.params')
const Server = require('../../src/server')
const rosnodejs = require('rosnodejs')
const exec = require('await-exec');

let nh;
let server;

beforeAll(async ()=>{
   server = new Server();
   await server.start();
   nh = await rosnodejs.initNode('/test_rosnodejs_roscpp_client', {rosMasterUri: "http://localhost:22114"});
})
it('vector test', async ()=>{
    let setParamReply = await nh.setParam('/test/joints', ['one', 'two'])
    expect(setParamReply).toEqual([1, 'param set at \'/test/joints\'', 0])
    const output = await exec('rosrun param_tester param_tester_node')
    expect(output.stdout).toEqual('one two ')
})
afterAll(async ()=>{
    await rosnodejs.shutdown();
    await server.stop();
    return 0;
})