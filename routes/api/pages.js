var express = require('express');
var router  = express.Router();

const Pages = require('../../models/pages')

router.post('/get', function(req, res, next) {
  // Entry ID
  let pageUrl = req.query.url

  // Get by ID
  Pages.get(pageUrl).then(page => {
    if (page && page.status === 'public') {
      res.json(page)
    } else {
      res.json({
        success: false,
        message: 'Entry not found.',
      })
    }
  })
})

module.exports = router
