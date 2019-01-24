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
        ds.getSystemState().then((data)=>{
            done();
        })
        
    })
})
it('topic subscribe', done =>{
    let ds = rosnodejs.nh
    let subscriber = ds.subscribe("/test_advertise1", "std_msgs/String",(msg)=>{
        debug(msg);
    })
    subscriber.on("registered", ()=>{
        ds.getSystemState().then((data)=>{
            done();
        })
    })
})
it('topic unsubscribe', async ()=>{
    let ds = rosnodejs.nh
    let res = await ds.unsubscribe("/test_advertise1")
    expect(res).toBeTruthy();
    expect(res[0]).toEqual(1)
    expect(res[2]).toEqual(1)
})
it('topic unadvertise', async ()=>{
    let ds = rosnodejs.nh
    let res = await ds.unadvertise("/test_advertise1")
    expect(res).toBeTruthy();
    expect(res[0]).toEqual(1)
    expect(res[2]).toEqual(1)
})

it('topic pub/sub', done =>{
    let ds = rosnodejs.nh
    let publisher = ds.advertise("/test_pub","std_msgs/String", {latching: true})
    publisher.on('registered', ()=>{
        const subscriber = ds.subscribe("/test_pub", "std_msgs/String", (msg)=>{
            expect(msg).toBeTruthy()
            expect(msg.data).toEqual("hello")
            done();
        })
        subscriber.on('registered', ()=>{
            publisher.publish({data: "hello"})
        })
    })
})

it('getTopicTypes', async() =>{
    let ds = rosnodejs.nh
    let data = await ds.getTopicTypes()
    expect(data).toBeTruthy();
})

it('getPublishedTopics', async()=>{
    let ds = rosnodejs.nh
    let res = await ds.getPublishedTopics();
    expect(res).toBeTruthy()
})

afterAll(async ()=>{
    await rosnodejs.shutdown();
    await server.stop();
    return 0;
})