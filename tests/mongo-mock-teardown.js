module.exports = async function(){
  console.log('== teardown.js ()', global.__TEST_CONFIG__)
  await global.__MONGODB__.stop().then(()=>{console.log('mongodb stopped')})
}
