var express = require('express')
var router = express.Router()

const apis = {
  '/entries': require('./entries'),
  '/media':   require('./media'),
}

for (let url in apis) {
  router.use( url, apis[url] )
}

module.exports = router
