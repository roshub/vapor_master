module.exports = {
    globals : {
        __TEST_MASTER_CONFIG__ : {
            'clean-db': true,
            db : 'mongodb://localhost:42771/jest',
            ROS_MASTER_URI: 'http://localhost:22114'
          }
    },
    testEnvironment: './mongo-mock-env.js',
    globalSetup: './mongo-mock-setup.js',
    globalTeardown: './mongo-mock-teardown.js'
}