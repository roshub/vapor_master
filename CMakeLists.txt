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

execute_process(COMMAND rm -rf ${CMAKE_CURRENT_SOURCE_DIR}/node_modules ${CMAKE_CURRENT_SOURCE_DIR}/dist )
execute_process(COMMAND npm --prefix ${CMAKE_CURRENT_SOURCE_DIR} install)
execute_process(COMMAND npm --prefix ${CMAKE_CURRENT_SOURCE_DIR} run prepare)
execute_process(COMMAND rm -rf ${CMAKE_CURRENT_SOURCE_DIR}/node_modules )
execute_process(COMMAND npm --prefix ${CMAKE_CURRENT_SOURCE_DIR} --production install)

install(PROGRAMS bin/vapor_master
        DESTINATION ${CATKIN_GLOBAL_BIN_DESTINATION}
)

install(PROGRAMS package.json
        DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}
)

install(DIRECTORY dist/
  DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}/dist
)

install(DIRECTORY launch/
  DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}/launch
)

install(DIRECTORY node_modules
        DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}
)
