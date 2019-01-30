const debug = require('debug')('test:rosnodejs-client:core')
const Server = require('../../src/server')
const rosnodejs = require('rosnodejs')

let nh;
let server;
let config = __TEST_MASTER_CONFIG__
let ROS_MASTER_URI = __TEST_MASTER_CONFIG__.ROS_MASTER_URI

beforeAll(async ()=>{
   server = new Server(config);
   await server.start();
   await rosnodejs.initNode('/test_rosnodejs_client', {rosMasterUri: ROS_MASTER_URI});
   nh = rosnodejs.nh
})
it('getURI', async ()=>{
    let ds = rosnodejs.nh
    let res = await ds.getMasterUri();
    expect(res).toBeTruthy()
    expect(res[0]).toEqual(1)
    expect(res[2]).toEqual('http://localhost:22114');
})

it('lookupNode', async ()=>{
    let ds = rosnodejs.nh
    let res = await ds._node.lookupNode('/test_rosnodejs_client');
    expect(res).toBeTruthy()
    expect(res[0]).toEqual(1)
    expect(res[2]).toBeTruthy()
})

it('getSystemState', async ()=>{
    let ds = rosnodejs.nh
    let res = await ds.getSystemState()
    expect(res).toBeTruthy()
})



afterAll(async ()=>{
    await rosnodejs.shutdown();
    await server.stop();
    return 0;
})