const debug = require('debug')('test.rosnodejs-client.topics')
const Server = require('../../src/server')
const rosnodejs = require('rosnodejs')

let nh;
let server;

beforeAll(async ()=>{
   server = new Server();
   await server.start();
   await rosnodejs.initNode('/test_rosnodejs_client', {rosMasterUri: "http://localhost:22114"});
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