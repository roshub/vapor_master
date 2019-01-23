const debug = require('debug')('test.rosnodejs-client.topics')
const Server = require('../../src/server')
const rosnodejs = require('rosnodejs')

let nh;
let server;

beforeAll(async ()=>{
   server = new Server();
   await server.start();
   nh = await rosnodejs.initNode('/test_rosnodejs_client', {rosMasterUri: "http://localhost:22114"});
})

it('topic pub', done =>{
    done()
})
afterAll(async ()=>{
    await rosnodejs.shutdown();
    await server.stop();
    return 0;
})