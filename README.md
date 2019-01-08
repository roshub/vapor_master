<img src=./icons/roshub_vector_logo.svg width=150>


Vapor is a high availibility rosmaster implementation

[![Build Status](http://build.ros.org/buildStatus/icon?job=Mdev__vapor_master__ubuntu_bionic_amd64)](http://build.ros.org/job/Mdev__vapor_master__ubuntu_bionic_amd64/)  [![Snap Status](https://build.snapcraft.io/badge/roshub/vapor_master.svg)](https://build.snapcraft.io/user/roshub/vapor_master)



# Introduction

Vapor-master is a drop in replacement for rosmaster enabling high availability ROS service discovery. Vapor removes the single point of failure fundamental to ROS1 enabling new options for achieving greater scale and uptime of ROS1 workflows.

# Installing

Vapor is available as a catkin package, debian package and Ubuntu Snap. We recommend consuming vapor via the debian package or Ubuntu Snap.


## Debian Package

 * [Install ROS Melodic](http://wiki.ros.org/melodic/Installation/)
 * `sudo apt install ros-melodic-vapor_master`

## Snap Package

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-white.svg)](https://snapcraft.io/vapor-master)

Vapor can be installed either by visiting the Ubuntu Snap store above or with the following command

* `snap install vapor-master`

Once installed the snap runs as a daemon until stopped using:

* `snap stop vapor-master`

To re-start simply:

* `snap start vapor-master`

# Configuring

Vapor can be configure in three was with highest precedence in order:

1. Command line flags
2. Environment variables
3. Configuration file

## Command Line Flags

```
Usage vapor-master
  --clean-db
  --no-clean-db
  --db=[mongo-uri]
  --ROS_MASTER_URI=[ros-master-uri]
```

## Environment Variables

 * $clean-db
 * $no-clean-db
 * $db=[mongodb-uri]
 * $ROS_MASTER_URI

## Configuration File

Vapor looks for configuration files in:

 * `$SNAP_COMMON/config.json`
   * If $SNAP_COMMON is defined
 * `$HOME/.vapor-master/config.json`
    * If $HOME is defined
 * `./config.json`
    * If neither $SNAP_COMMON or $HOME are defined


# Developing

To develop you will need to install

 * nodejs
 * yarn
 * ROS Melodic

To interactively develop run:

```
yarn
yarn watch
```

## Roadmap

 * Support snap configuration
 * Tutorials
 * ROS Api
    * Database availability as ROS Topic
    * Vapor instance as ROS Topic
    * Rosgraph outage reporting as Topic and Action
 * hot-swap support
    * Detect and report lost mongo replicas
    * Automatic db replicaset expansion
 * rosout leader election
 * Autostart via systemd on Ubuntu/debian

# Credits

[<img src=./icons/roshub_logo_cropped_large.png width=300>](https://roshub.io)

Vapor is open source software developed by [RosHub Inc.](https://roshub.io)

 * Philetus Weller
 * Nick Zatkovich
 * Alan Meekins