const debug = require('debug')('test:test_rosmaster:rosmaster')
const Server = require('../../src/server')
const rosnodejs = require('rosnodejs')
const exec = require('await-exec');
const parseRosTestOutput = require('../rosTestParser.js').parseRosTestOutput
const { spawn } = require('child_process')

let nh;
let server;
let config = __TEST_MASTER_CONFIG__
let ROS_MASTER_URI = __TEST_MASTER_CONFIG__.ROS_MASTER_URI
let execEnv = process.env
execEnv.ROS_MASTER_URI = ROS_MASTER_URI
execEnv.ROSCONSOLE_STDOUT_LINE_BUFFERED = 1
let saveConsoleError = console.error
console.error = jest.fn();


beforeAll(async ()=>{
   server = new Server(config);
   await server.start();
   nh = await rosnodejs.initNode('/test_rosmaster', {rosMasterUri: ROS_MASTER_URI});
})

it('test_rosmaster rosmaster.test', async ()=>{
    let setParamReply = await nh.setParam('/test/joints', ['one', 'two'])
    expect(setParamReply).toEqual([1, 'param set at \'/test/joints\'', 0])
    let output = null
    try {
         output = await exec('rostest -r test_rosmaster rosmaster.test',
                        {env: execEnv})
    } catch (e) {
        //ignore the error code
        output = { stdout: e.stdout }
    }

    const testOutput = parseRosTestOutput(output.stdout);
    let resultsString = ""

    for (testResult of testOutput.results){
        resultsString = resultsString + testResult.name + ": " + testResult.result + "\n"
        if (testResult.result != 'passed'){
            resultsString += "\n" + testResult.error + "\n"
        }
    }

    resultsString += "\nSUMMARY\n"
    resultsString += "result: " + testOutput.summary.result + "\n"
    resultsString += "tests: " + testOutput.summary.tests + "\n"
    resultsString += "errors: " + testOutput.summary.errors + "\n"
    resultsString += "failures: " + testOutput.summary.failures + "\n"

    if (testOutput.summary.result.match("SUCCESS")){
        console.log(resultsString)
    } else {
        console.error = saveConsoleError
        console.error(testOutput)
        fail("rosmaster.test failed: \n" + resultsString);
    }
},30000)

afterAll(async ()=>{
    await rosnodejs.shutdown();
    await server.stop();
    return 0;
})