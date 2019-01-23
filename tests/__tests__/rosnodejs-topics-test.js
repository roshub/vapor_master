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

it('topic advertise', done =>{
    let ds = rosnodejs.nh
    let publisher = ds.advertise("/test_advertise1","std_msgs/String")
    publisher.on('registered', (msg)=>{
        done();
    })
})
it('topic publish', done =>{
    let ds = rosnodejs.nh
    let publisher = ds.advertise("/test_pub","std_msgs/String")
    publisher.on('registered', ()=>{
        const subscriber = ds.subscribe("/test_pub", "std_msgs/String", (msg)=>{
            expect(msg).toBeTruthy()
            expect(msg.data).toEqual("hello")
            done();
        })
        subscriber.on('registered', ()=>{
            debug("hello!")
            publisher.publish({data: "hello"}, -1)
        })
    })
}, 10000)
afterAll(async ()=>{
    await rosnodejs.shutdown();
    await server.stop();
    return 0;
})