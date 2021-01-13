var createError  = require('http-errors')
var express      = require('express')
var path         = require('path')
var cookieParser = require('cookie-parser')
var logger       = require('morgan')
var fs           = require('fs')
var cors         = require('cors')
var helmet       = require('helmet')

/**
 * TODOS:
 * TODO: Limit connections per 10 seconds
 */

// Routers
var middleware  = require('./routes/middleware')
var indexRouter = require('./routes/index')
var apiRouter   = require('./routes/api')

var app = express()

// let corsOptions = {
//   origin: '*',
//   credentials: true,
// }

// app.use(cors(corsOptions))
app.use(helmet())

app.disable('x-powered-by')

// view engine setup
// app.engine('html', require('ejs').renderFile)
// app.set('view engine', 'html')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser('fm3uF(SEflsleP#FMsmlemf'))
app.use(express.static(path.join(__dirname, 'public')))

// middleware
middleware.init({ app })

app.use('/', indexRouter)
app.use('/api', apiRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// let errorHtml = fs.readFileSync( __dirname + '/views/error.html', 'utf8')

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message
  // res.locals.error   = req.app.get('env') === 'development' ? err : {}

  // render the error page
  // res.status(err.status || 500)
  
  // res.setHeader('Content-type', 'text/html')
  // res.setHeader('Content-length', errorHtml.length)
  // res.end(errorHtml)

  res.json({
    success: false,
    message: 'Only API methods available.',
  })
})

module.exports = app
