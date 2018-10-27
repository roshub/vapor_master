'use strict';

const path = require('path');
const mongoose = require('mongoose')

let exposed = {}

require("fs").readdirSync(__dirname).forEach( (file)=>{
  if(file == path.basename(__filename)){return}
  let title = file.replace('.js', '')
  exposed[title] = mongoose.model('vapor_'+title, require('./'+title))
});

module.exports = exposed
