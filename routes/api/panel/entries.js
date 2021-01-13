var express = require('express');
var router  = express.Router();

const Posts = require('../../../models/posts')

// Create new post
router.post('/create', function(req, res, next) {
  if (!req.user || !req.user.is_admin()) {
    res.json({
      success: false,
      message: 'You have not permissions',
    })
    return
  }

  console.log( req.body );

  res.json({
    success: false,
    message: 'Entry was not created',
  })
})


// Get posts
router.post('/get', function(req, res, next) {
  let entryId = req.query.id

  let page   = req.body.page || 0
  let limit  = req.body.count
  let offset = (page - 1) * limit
  let sort_key  = req.body.sort_key
  let sort_type  = req.body.sort_type

  // Get recent entries
  if ( typeof entryId === 'undefined' ) {
    Posts.find(null, { limit, offset, sort_key, sort_type }).then(posts => {
      res.json({
        list: posts.posts,
        count: posts.count,
      })
    })
    return
  }

  // Get by ID
  Posts.get(entryId).then(post => {
    if (post) {
      res.json(post)
    } else {
      res.json({
        success: false,
        message: 'Entry not found',
      })
    }
  })
})

module.exports = router
