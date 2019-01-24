const rosnodejs = require("rosnodejs")

rosnodejs.initNode("testnode").then((nh)=>{
    nh = rosnodejs.nh;
    const sub = nh.subscribe('/chatter', 'std_msgs/String', (msg) => {
    console.log('Got msg on chatter: %j', msg);
    });

    const pub = nh.advertise('/chatter', 'std_msgs/String');
    pub.publish({ data: "hi" });

})