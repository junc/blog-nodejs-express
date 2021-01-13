var express = require('express')
var router = express.Router()

const apis = {
  '/entries': require('./api/entries'),
  '/pages':   require('./api/pages'),
  // '/users':   require('./api/users'),
  
  // '/signin':  require('./api/signin'),
  // '/logout':  require('./api/logout'),

  // '/panel':   require('./api/panel/index'),
}

for (let url in apis) {
  router.use( url, apis[url] )
}

module.exports = router
