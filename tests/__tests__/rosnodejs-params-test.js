const debug = require('debug')('test:rosnodejs-client:params')
const Server = require('../../src/server')
const rosnodejs = require('rosnodejs')

let nh;
let server;
let config = __TEST_MASTER_CONFIG__
let ROS_MASTER_URI = __TEST_MASTER_CONFIG__.ROS_MASTER_URI

beforeAll(async ()=>{
   server = new Server(config);
   await server.start();
   nh = await rosnodejs.initNode('/test_rosnodejs_client', {rosMasterUri: ROS_MASTER_URI});
})

it('get param -> run_id', async ()=>{
    expect(nh).toBeTruthy();
    let run_id = await nh.getParam('run_id');
    expect(run_id).toBeTruthy();
})
it('set param', async ()=>{
    let setParamReply = await nh.setParam('/test/testval', 2)
    expect(setParamReply).toEqual([1, 'param set at \'/test/testval\'', 0])
    let val = await nh.getParam('/test/testval');
    expect(val).toEqual(2);
})
it('has param', async ()=>{
    let hasParamReply = await nh.hasParam('/test/testval')
    expect(hasParamReply).toEqual(true);
})
it('get param names', async()=>{
    let getParamReply = await nh._node._paramServerApi.getParamNames(nh.getNodeName())
    expect(getParamReply).toBeTruthy()
})
it('delete param', async()=>{
    let deleteParamReply;
    try{
        deleteParamReply = await nh.deleteParam('/test/testval')
        expect(deleteParamReply).toEqual([ 1, 'param at \'/test/testval\' deleted', 0 ] )
    }
    catch(error){
        debug(deleteParamReply)
        debug("error!")
        debug(error)
    }
})
afterAll(async ()=>{
    await rosnodejs.shutdown();
    await server.stop();
    return 0;
})