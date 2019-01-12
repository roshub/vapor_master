<img src=./icons/roshub_vector_logo.svg width=150>


Vapor is a high availibility rosmaster implementation

[![Build Status](http://build.ros.org/buildStatus/icon?job=Mdev__vapor_master__ubuntu_bionic_amd64)](http://build.ros.org/job/Mdev__vapor_master__ubuntu_bionic_amd64/)  [![Snap Status](https://build.snapcraft.io/badge/roshub/vapor_master.svg)](https://build.snapcraft.io/user/roshub/vapor_master)


# Introduction

Vapor-master is a drop in replacement for rosmaster enabling high availability ROS service discovery. Vapor removes the single point of failure fundamental to ROS1 enabling new options for achieving greater scale and uptime of ROS1 workflows.

# Installing

Vapor is available as a catkin package, debian package and Ubuntu Snap. We recommend consuming vapor via the debian package or Ubuntu Snap.

### Prerequisites

A requirement of vapor is that you have installed and configured mongodb for your environment. For local testing you can simply run:

* `sudo apt install mongodb`

### Non-requirements

Vapor does not strictly require a ROS installtion, it can simply be run as a micro service if so desired.

## Debian Package

**NOTE:** We are still awaiting the next rosdistro sync for Melodic, you can [follow sync status here](http://repositories.ros.org/status_page/ros_melodic_default.html?q=vapor)

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

You can manually start vapor for:

* `snap run vapor-master`

You can debug by seting the `DEBUG` environment variable:

* `DEUBG=* snap run vapor-master`

All command line flags are accessible via the snap as well:

* `snap run vapor-master --help`

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
 * Write Tutorials
 * Complete ROS API implementation
    * Database availability as ROS Topic
    * Vapor instance as ROS Topic
    * Rosgraph outage reporting as Topic and Action
 * hot-swap support
    * Detect and report lost mongo replicas
    * Automatic db replicaset expansion
 * rosout leader election
 * Autostart via systemd on Ubuntu/debian

## Further Reading

* [Annoucement Blog Post](https://medium.com/roshub/introducing-vapor-a-high-availability-ros-1-x-master-19d66506cb7a)
* [Wiki Page](http://wiki.ros.org/vapor_master)

# Support

Should you need professional support, [contact us](https://roshub.io/contact/).

# Credits

[<img src=./icons/roshub_logo_cropped_large.png width=300>](https://roshub.io)

Vapor is open source software developed by [RosHub Inc.](https://roshub.io)

 * Philetus Weller
 * Nick Zatkovich
 * Alan Meekins
