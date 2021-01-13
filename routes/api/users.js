var express = require('express');
var router  = express.Router();

const db = require('../../configs/database')
const Users = require('../../models/users')

router.post('/getCurrent', function(req, res, next) {
  if (req.user) {
    res.json({
      success: true,
      data: req.user,
    })
    return
  }

  res.json({
    success: false,
    message: 'User not found.',
  })
})

module.exports = router
