#include <ros/ros.h>
#include <ros/param.h>
#include <ros/console.h>

#include <ros/xmlrpc_manager.h>
#include <std_msgs/String.h>

int main(int argc, char **argv)
{
    XmlRpc::XmlRpcValue params, result, payload;

    ros::init(argc, argv, "test_node");

    ros::NodeHandle nh("~");

    ros::param::set("~test_set_param", "");

    ROS_INFO("Created new parameter through XmlRpc API call.");

    params[0] = ros::this_node::getName();
    params[1] = ros::XMLRPCManager::instance()->getServerURI();
    params[2] = ros::names::resolve(std::string("~test_param"));

    if (ros::master::execute("getParam", params, result, payload, false)) {
        ROS_INFO("Subscribed to parameter.");
    }
    else {
        ROS_ERROR("Failed to subscribe to the parameter.");
    }
    
    while (nh.ok()) {
        ros::spinOnce();
        
    }
    return 0;
}
