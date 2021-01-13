var express = require('express')
var fs      = require('fs')
var router  = express.Router()

// Get file content once
// let bodyHtml = fs.readFileSync( __dirname + '/../views/index.html', 'utf8')

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.setHeader('Content-type', 'text/html')
  // res.setHeader('Content-length', bodyHtml.length)
  // res.end(bodyHtml)

  res.json({
    success: false,
    message: 'Only API methods available.',
  })
})

module.exports = router
