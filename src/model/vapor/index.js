'use strict';

const path = require('path');
const mongoose = require('mongoose')

let exposed = {
  param : mongoose.model('vapor_param', require('./param')),
  paramSub : mongoose.model('vapor_paramSub', require('./paramSub')),
  rosnode : mongoose.model('vapor_rosnode', require('./rosnode')),
  servicePro : mongoose.model('vapor_servicePro', require('./servicePro')),
  topic : mongoose.model('vapor_topic', require('./topic')),
  topicXub : mongoose.model('vapor_topicXub', require('./topicXub'))
}

module.exports = exposed
