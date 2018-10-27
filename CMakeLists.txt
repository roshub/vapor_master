cmake_minimum_required(VERSION 2.8.3)
project(vapor_master)

find_package(catkin REQUIRED COMPONENTS
  std_msgs
)

catkin_package(
#  INCLUDE_DIRS include
  LIBRARIES vapor_master
  CATKIN_DEPENDS std_msgs
  DEPENDS nodejs
)

execute_process(COMMAND yarn --cwd ${CMAKE_CURRENT_SOURCE_DIR} install)

install(PROGRAMS bin/vapor_master
        DESTINATION ${CATKIN_GLOBAL_BIN_DESTINATION}
)

install(PROGRAMS package.json
        DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}
)

install(PROGRAMS index.js
        DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}
)

install(DIRECTORY src/
  DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}/src
)

install(DIRECTORY launch/
  DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}/launch
)

install(DIRECTORY node_modules
        DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}
)
