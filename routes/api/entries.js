var express = require('express');
var router  = express.Router();

const Posts = require('../../models/posts')

router.post('/get', function(req, res, next) {
  // Entry ID
  let entryId = req.query.id

  // Pagination
  let page   = req.body.page || 0
  let limit  = req.body.count
  let offset = (page - 1) * limit

  // Sorting
  let sort_key  = req.body.sort_key || 'id'
  let sort_type  = req.body.sort_type || 'desc'

  // Get recent entries
  if ( typeof entryId === 'undefined' ) {
    Posts.find({status: 'public'}, { limit, offset, sort_key, sort_type }).then(posts => {
      res.json({
        list: posts.posts,
        count: posts.count,
      })
    }).catch(err => {
      res.json({
        success: false,
        message: 'No entries yet.',
      })
    })
    return
  }

  // Get by ID
  Posts.get(entryId).then(post => {
    if (post && post.status === 'public') {
      res.json(post)
    } else {
      res.json({
        success: false,
        message: 'Entry not found.',
      })
    }
  })
})

module.exports = router
