'use strict'
const xmlrpc = require('@roshub/express-xmlrpc')
const express = require('express')
const morgan = require('morgan')
// singleton ros master server
const Master = require('./master.js')
const uuidv1 = require('uuid/v1')
const paramUtil = require('./param-util.js')
const debug = require('debug')('vapor-master:server')


class Server {
  constructor(config){
    this.app = express()
    this.server = null
    this.errorHandlerTimer = null
    // setup request logging
    //app.use(morgan('combined'))
    this.config = config
    this.master = new Master({config: this.config});

    // xmlrpc message parsing middleware
    // parses request stream & sets request.body.method & request.body.params
    this.app.use(xmlrpc.bodyParser)

    // ros master implemented as express route handler
    // gets method & parameters from request.body values set by middleware
    // calls xmlrpc.serializeResponse() to generate response from return values
    this.app.post(
      '*', 
      xmlrpc.apiHandler(this.master.api, this.master, this.master.onError, this.master.onMiss)
    )
  }

  handleServerErrorRetry(error){
    debug('ERROR - ', JSON.stringify(error))
    this.errorHandlerTimer = setTimeout( ()=>{

      if(this.server){
        //this.server = null
        this.stop().then(()=>{
          this.start(true)
        })
      }

    }, 1500)
  }


  async start(retry) {
    debug('starting server')
    // parse uri string for server to listen at
    this.master.setUri(this.config.ROS_MASTER_URI)
    try {
      await this.master.start();
      if (this.config['clean-db']) {
        await this.master.cleanDb()
      }
      await paramUtil.set(this.master.db, "/run_id", uuidv1(), "/", "127.0.0.1")
      await this.startListening(retry)
    } catch (err){
      console.log("EXIT")
      if(err){
        console.error('error: ', err)
      }
      process.exit(1)
    }
    return "started!";
  }

  async startListening(retry){
    return new Promise((resolve, reject)=>{
      try {
        this.server = this.app.listen(this.master.uri.port, this.master.uri.hostname, ()=>{  
          debug(`vapor master listening at '${this.master.uri.href}'`)
          this.server.removeAllListeners('error')
          if(!retry){ return resolve() }
        })    
      } catch(err){
        console.log("EXIT")

        if(err){
          console.error('error: ', err)
        }
        process.exit(1)
    
      }
    });
  }

  async stop() {
    return new Promise((resolve, reject)=>{
      if(!this.server || !this.server.listening){ return resolve() }

      this.server.close((err)=>{
        if(!err){
          debug('stopped server')
          return resolve()
        }

        debug('error encountered stopping server')
        return reject(err)
      })

    })
    
  }
}

module.exports = Server
