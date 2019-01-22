'use strict'
const xmlrpc = require('@roshub/express-xmlrpc')
const express = require('express')
const morgan = require('morgan')
const Model = require('./model-interface.js')
const Config = require('./config.js')
// singleton ros master server
const master = require('./master.js')
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

    // xmlrpc message parsing middleware
    // parses request stream & sets request.body.method & request.body.params
    this.app.use(xmlrpc.bodyParser)

    // ros master implemented as express route handler
    // gets method & parameters from request.body values set by middleware
    // calls xmlrpc.serializeResponse() to generate response from return values
    this.app.post(
      '*', 
      xmlrpc.apiHandler(master.api, master, master.onError, master.onMiss)
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
    let promises = []

    // parse uri string for server to listen at
    master.setUri(Config.read('ROS_MASTER_URI'))

    // if clean database flag is set clear all data from db
    if (Config.read('clean-db')) {
      master.cleanDb().then(()=>{
        // set run_id
        paramUtil.set("/run_id", uuidv1(), "/", "127.0.0.1")
      })
    }
    else{
      // set run_id
      promises.push( paramUtil.set("/run_id", uuidv1(), "/", "127.0.0.1") )
    }

    

    let serverStart = new Promise((resolve,reject)=>{


      this.server = this.app.listen(master.uri.port, master.uri.hostname, ()=>{
        //debug('server listening')
        //debug('address', this.server.address())
        clearTimeout(this.errorHandlerTimer)
        this.errorHandlerTimer = null


        debug(`vapor master listening at '${master.uri.href}'`)
        this.server.removeAllListeners('error')

        let dbPromise = Model.connect().then(()=>{
          debug("Connected to Database")
        })

        if(!retry){ return resolve(dbPromise) }
      })

      if(retry){ 
        // retry after errors
        this.server.on('error', this.handleServerErrorRetry.bind(this))
        return resolve()
      }
      else {
        // stop after errors
        const errorHandler = async (error)=>{
          debug('CRITICAL', JSON.stringify(error))
          await this.stop()
          reject(error)
        }

        this.server.on('error', errorHandler)
      }
    }).catch((err)=>{

      console.log("EXIT")

      if(err && err.errno!='EADDRINUSE'){
        console.error('error', err)
      }
      process.exit(1)
    })

    promises.push(serverStart)

    return Promise.all(promises)
  }

  async stop() {
    return new Promise((resolve, reject)=>{
      if(!this.server || !this.server.listening){ return resolve() }

      this.server.stop((err)=>{
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
