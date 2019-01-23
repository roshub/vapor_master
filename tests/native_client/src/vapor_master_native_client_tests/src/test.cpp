#include <ros/ros.h>
#include <ros/console.h>

#include <vector>
#include <iostream>
#include <algorithm>

int main(int argc, char** argv){

  ros::init(argc, argv, "test");
  ros::NodeHandle nh("~");

  std::vector<std::string> joints;


  // following expression always returns empty vector, even if parameter exists and fully-qualified path for the parameter is valid
  nh.param<std::vector<std::string>>("joints", joints, std::vector<std::string>());

//  std::cout << joints << std::endl;
  std::for_each(
    joints.cbegin(),
    joints.cend(),
    [] (const std::string c) {std::cout << c << " ";}
  );
}
