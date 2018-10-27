cmake_minimum_required(VERSION 2.8.3)
project(vapor_master)

find_package(catkin REQUIRED COMPONENTS
  std_msgs
)

catkin_package(
#  INCLUDE_DIRS include
#  LIBRARIES vapor_master
    CATKIN_DEPENDS std_msgs
#  DEPENDS system_lib
)

include_directories(
# include
  ${catkin_INCLUDE_DIRS}
)

execute_process(COMMAND npm --prefix ${CMAKE_CURRENT_SOURCE_DIR} install ${CMAKE_CURRENT_SOURCE_DIR})
execute_process(COMMAND npm --prefix ${CMAKE_CURRENT_SOURCE_DIR} run build-webpack-production)
execute_process(COMMAND npm --prefix ${CMAKE_CURRENT_SOURCE_DIR} run postinstall)

install(PROGRAMS bin/vapor_master
        DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}
)

