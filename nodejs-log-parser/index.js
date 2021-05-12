'use strict'

const express = require('express')
const morgan = require('morgan')
const { HTTP_PORT } = require('./config')
const log = require('./log')
const parser = require('./parser')
const app = express()

async function main () {
  log.info('kafka connections starting up')
  await parser()
  log.info('kafka connections ready')

  log.info('starting http server')

  app.use(morgan('combined'))

  require('kube-probe')(app)

  app.get('/', (req, res) => {
    res.end('ok')
  })

  app.listen(HTTP_PORT, () => {
    log.info(`🚀 http server listening on ${HTTP_PORT}`)
  })
}

main()
