const debug = require('debug')('test:test_rosmaster:rosmaster')
const Server = require('../../src/server')
const rosnodejs = require('rosnodejs')
const exec = require('await-exec');
const { spawn } = require('child_process')

let nh;
let server;
let config = __TEST_MASTER_CONFIG__
let ROS_MASTER_URI = __TEST_MASTER_CONFIG__.ROS_MASTER_URI
let execEnv = process.env
execEnv.ROS_MASTER_URI = ROS_MASTER_URI
execEnv.ROSCONSOLE_STDOUT_LINE_BUFFERED = 1

beforeAll(async ()=>{
   server = new Server(config);
   await server.start();
   nh = await rosnodejs.initNode('/test_rosnodejs_roscpp_client', {rosMasterUri: ROS_MASTER_URI});
})

it('vector test', async ()=>{
    let setParamReply = await nh.setParam('/test/joints', ['one', 'two'])
    expect(setParamReply).toEqual([1, 'param set at \'/test/joints\'', 0])
    const output = await exec('rosrun param_tester param_tester_vector_node', 
                        {env: execEnv})
    expect(output.stdout).toEqual('one two ')
})


it('param subscription', done =>{
    let subprocess = spawn('rosrun', ['param_tester', 'param_tester_paramSub_node'], {env: execEnv})
    subprocess.stdout.on('data', (data)=>{
        if (data.includes("Subscribed to parameter")){
            nh.setParam('/test_node/test_param', "hello").then((reply)=>{
                expect(reply).toEqual([1, 'param set at \'/test_node/test_param\'', 0])
            });        
        } else if (!data.includes("Created new parameter through XmlRpc API call.")){
            fail(new Error("unexpected output"))
        }
    })
    subprocess.stderr.on("data", (data)=>{
        if (data.includes("Updated parameter: hello")){
            subprocess.kill('SIGTERM')
            done()
        } else {
            subprocess.kill('SIGTERM')
            fail(new Error("unexpected output"))
        }
    })
    subprocess.on('error', (err)=>{
        fail(new Error("process failed"))
    })
})

afterAll(async ()=>{
    await rosnodejs.shutdown();
    await server.stop();
    return 0;
})