var express = require('express');
var router  = express.Router();

const Users = require('../../models/users')

/**
 * URL: /signin
 * Data:
 * username - User email
 * password - User password
 */
router.post('/', function(req, res, next) {
  let username = req.body.username
  let password = req.body.password

  let errorJson = {
    success: false,
    message: 'User or password is incorrect.',
  }

  let findOptions = {
    email: username,
    password: Users.hash(password)
  }

  Users.findOne(findOptions)
    .then(user => {
      if (!user) {
        res.json(errorJson)
        return
      }

      // Create user session
      Users.login(user, req, res)
        .then(session => {
          user.session = session
          res.json({
            success: true,
            data: user
          })
        })
    })
    .catch(err => {
      res.json(errorJson)
    })
})

module.exports = router
