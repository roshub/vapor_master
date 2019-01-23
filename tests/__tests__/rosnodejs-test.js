const debug = require('debug')('test.rosnodejs.client')
const Server = require('../../src/server')
const rosnodejs = require('rosnodejs')

let nh;
let server;

beforeAll(async ()=>{
   server = new Server();
   await server.start();
   nh = await rosnodejs.initNode('/test_rosnodejs_client', {rosMasterUri: "http://localhost:22114"});
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
        debug(error.statusCode)
        debug(error.statusMessage)
    }
})
