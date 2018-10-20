'use strict'

const IS_DEBUG = process.env.NODE_ENV === 'development'

// ----------------------------------------
// Load app configuration
// ----------------------------------------

const yaml = require('js-yaml')
const fs = require('fs')
let appconfig = {}
try {
  appconfig = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'))
} catch (e) {
  console.error(e)
}

// ----------------------------------------
// Load dependencies
// ----------------------------------------

let R = {
  logger: require('./modules/logger')(),
  conf: appconfig
}
global.R = R

const autoload = require('auto-load')
const bodyParser = require('body-parser')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const express = require('express')
const favicon = require('serve-favicon')
const http = require('http')
const session = require('express-session')

const mw = autoload('./middlewares')
const ctrl = autoload('./controllers')

// ----------------------------------------
// Define Express App
// ----------------------------------------

const app = express()
app.use(compression())

// ----------------------------------------
// Security
// ----------------------------------------

app.use(mw.security)

// ----------------------------------------
// Public Assets
// ----------------------------------------

app.use(favicon('./assets/favicon.ico'))
app.use(express.static('./assets', {
  index: false,
  maxAge: '7d'
}))

// ----------------------------------------
// Passport Authentication
// ----------------------------------------

app.use(cookieParser())

// ----------------------------------------
// SEO
// ----------------------------------------

app.use(mw.seo)

// ----------------------------------------
// View Engine Setup
// ----------------------------------------

app.set('views', './views')
app.set('view engine', 'pug')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// ----------------------------------------
// View accessible data
// ----------------------------------------

app.locals.conf = global.R.conf
app.locals._ = require('lodash')

// ----------------------------------------
// Controllers
// ----------------------------------------

app.use('/', ctrl.main)

// ----------------------------------------
// Error handling
// ----------------------------------------

app.use(function (req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: IS_DEBUG ? err : {}
  })
})

// ----------------------------------------
// Start HTTP server
// ----------------------------------------

global.R.logger.info('Starting HTTP server on port ' + global.R.conf.port + '...')

app.set('port', global.R.conf.port)
let server = http.createServer(app)

server.listen(global.R.conf.port)
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      global.R.logger.error('Listening on port ' + global.R.conf.port + ' requires elevated privileges!')
      return process.exit(1)
    case 'EADDRINUSE':
      global.R.logger.error('Port ' + global.R.conf.port + ' is already in use!')
      return process.exit(1)
    default:
      throw error
  }
})

server.on('listening', () => {
  global.R.logger.info('HTTP server started successfully! [RUNNING]')
})
