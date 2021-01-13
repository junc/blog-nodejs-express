var express = require('express');
var router  = express.Router();

const Users = require('../../models/users')

/**
 * URL: /logout
 * Data:
 * session - User session key
 */
router.post('/', function(req, res, next) {
  let session = req.body.session

  let cookie_user_id      = req.signedCookies.user_id
  let cookie_user_session = req.signedCookies.user_session

  if (!req.user || !cookie_user_id || !cookie_user_session) {
    res.json({
      success: false,
      message: 'User already logged out.',
    })
    return
  }

  if (session !== cookie_user_session) {
    res.json({
      success: false,
      message: 'Session key is wrong.',
    })
    return
  }

  Users.logout(req.user.id, cookie_user_session, res)
    .then(() => {
      res.json({
        success: true,
      })
    })
})

module.exports = router
