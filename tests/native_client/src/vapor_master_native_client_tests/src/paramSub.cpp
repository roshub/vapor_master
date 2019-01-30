#include <ros/ros.h>
#include <ros/param.h>
#include <ros/console.h>

#include <ros/xmlrpc_manager.h>
#include <std_msgs/String.h>

void callback(XmlRpc::XmlRpcValue& params, XmlRpc::XmlRpcValue& result)
{
   std::string resp = params.toXml();
   ROS_ERROR_STREAM("Updated parameter: " << params[2]);
   result[0] = 1;
   result[1] = std::string("");
   result[2] = 0;

   //ros::param::update((std::string)params[1], params[2]);
}

int main(int argc, char **argv)
{
    XmlRpc::XmlRpcValue params, result, payload;

    ros::init(argc, argv, "test_node");

    ros::NodeHandle nh("~");

    ros::XMLRPCManager::instance()->unbind("paramUpdate");
    ros::XMLRPCManager::instance()->bind("paramUpdate", callback);

    ros::param::set("~test_param", true);

    ROS_INFO("Created new parameter through XmlRpc API call.");

    params[0] = ros::this_node::getName();
    params[1] = ros::XMLRPCManager::instance()->getServerURI();
    params[2] = ros::names::resolve(std::string("~test_param"));

    if (ros::master::execute("subscribeParam", params, result, payload, false)) {
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
