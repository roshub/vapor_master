const debug = require('debug')('test.rosnodejs-client.services')
const Server = require('../../src/server')
const rosnodejs = require('rosnodejs')

let nh;
let server;

beforeAll(async ()=>{
   server = new Server();
   await server.start();
   nh = await rosnodejs.initNode('/test_rosnodejs_client', {rosMasterUri: "http://localhost:22114"});
})

it('register service', done =>{
    expect(nh).toBeTruthy();
    let serviceServer = nh.advertiseService("test_service", "std_srvs/SetBool", (req, res)=>{
        expect(req.data).toEqual(true)
        res.success = true;
        res.message = "Set the bool!";
        return true;
    })
    nh.waitForService("/test_service").then((success)=>{
        expect(success).toEqual(true)
        let serviceClient = nh.serviceClient("/test_service", "std_srvs/SetBool")
        serviceClient.call({data:true}).then((res)=>{
            expect(res).toBeTruthy()
            expect(res.success).toEqual(true)
            expect(res.message).toEqual("Set the bool!")
            done()
        })
    })
})
it('unregister service', done =>{
    nh.unadvertiseService("/test_service").then((res)=>{
        expect(res).toBeTruthy();
        expect(res[0]).toEqual(1)
        expect(res[2]).toEqual(1)
        done();
    })
})
afterAll(async ()=>{
    await rosnodejs.shutdown();
    await server.stop();
    return 0;
})