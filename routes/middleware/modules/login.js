const path = require('path')
const Users = require( path.resolve( 'models/users' ) )

/**
 * Set current user to req.user
 * In next functions req.user will be available.
 * 
 * Warning! This function must be sync!
 */
function login(req, res, next) {
  Users.loginByCookies( req.signedCookies )
    .then(user => {
      if (user) {
        req.user = user
      }
      next()
    })
    .catch(err => {
      next()
    })
}

module.exports = login
