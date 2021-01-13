
const sha512 = require('js-sha512').sha512;
const db = require('../configs/database')

const User = require('./user')


/**
 * Do not change in production!
 * Uses for hash passwords.
 */
const PASSWORD_SALT = '32lkfMP#qwef_Q#Lf;lw3';

/**
 * Cookie lifetime.
 * 5 years
 */
const COOKIE_EXPIRES = 86400 * 365 * 5

/**
 * Generate random string.
 * 
 * @see https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
 * @param {Number} length Result string length
 */
function randomString(length) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = Array(length)
    .join()
    .split(',')
    .map(() => alphabet.charAt( Math.floor(Math.random() * alphabet.length) ) )
    .join('')
  return result
}

class Users
{
  /**
   * Find users by options.
   * 
   * @example Users.find( {email: 'some@user.email'} )
   * @example Users.find( {email: {value: 'user.email', like: '%$%'} } )
   * 
   * @param {Object} options Key the same with columns in table `users`.
   * @param {Number} limit 
   * @param {Number} offset 
   */
  static async find(options, limit, offset) {
    let index = 0
    let statements = []
    let values = []

    for (let key in options) {
      index++
      let value = options[ key ]

      /**
       * If value is object with keys like
       * {
       *   value: 'unit value',
       *   like: '%$%'
       * }
       * or
       * {
       *   min: 10,
       *   max: 20
       * }
       */
      if (value instanceof Object && value.value) {
        // BETWEEN
        if (typeof value.min !== 'undefined' && typeof value.max !== 'undefined') {
          let min = index
          let max = ++index

          // `{key}` BETWEEN min AND max
          statements.push(`${key} BETWEEN $${min} AND $${max}`)
          values.push(value.min)
          values.push(value.max)
        }
        // LIKE
        else if (typeof value.like !== 'undefined') {
          let like = value.like.replace('$', '$' + index + '#')

          // `{key}` LIKE '{like}'
          statements.push(`${key} LIKE '${like}'`)
          values.push(value.value)
        }
      }
      // Single unit value
      else {
        /**
         * {key} = $N
         * @example login = $1
         */
        statements.push(`${key} = $${index}`)
        values.push(value)
      }
    }

    if (!offset) {
      offset = 0
    }

    let limitStatement = ''
    if (limit && Number.isInteger(limit)) {
      limitStatement = ' LIMIT ' + limit
      if (offset) {
        limitStatement += ' OFFSET ' + offset
      }
    }

    let statement = statements.join(' AND ')
    if (statement.length) {
      statement = ' WHERE ' + statement;
    }
    try {
      const users = await db.query('SELECT * FROM users' + statement + limitStatement, values)
      return users
    } catch (err) {
      throw new Error(err)
    }
  }


  /**
   * Find one user by options.
   * 
   * @see Users.find
   * @param {Object} options 
   */
  static async findOne(options) {
    let result = null

    await this.find(options, 1)
      .then(data => {
        if (data) {
          result = data[0]
        }
      })
    
    return result
  }


  /**
   * Get user by ID.
   * 
   * @param {Number} user_id
   */
  static async getById(user_id) {
    try {
      const user = await db.one('SELECT * FROM users WHERE id = $1', [user_id])
      return user
    } catch (err) {
      throw new Error(err)
    }
  }


  /**
   * Get session by ID.
   * 
   * @param {Number} session_id 
   */
  static async getSessionById(session_id) {
    try {
      const session = await db.one('SELECT * FROM users_sessions WHERE id = $1', [session_id])
      return session
    } catch (err) {
      throw new Error(err)
    }
  }


  /**
   * Login by cookies.
   * 
   * @param {Object} cookies
   * @return {Object} Returns current user and user.session with current session
   */
  static async loginByCookies(cookies) {
    let user_id      = cookies.user_id
    let user_session = cookies.user_session

    if (typeof user_id === 'undefined' || typeof user_session === 'undefined') {
      return null
    }

    let user = await this.getById(user_id)

    try {
      const session = await db.one(`
        SELECT *
        FROM users_sessions
        WHERE user_id = $1
          AND session_key = $2
        ORDER BY id DESC
        LIMIT 1`
      , [ user_id, user_session ])

      user.session = session
      // user.options = options

      return new User(user)
    } catch (err) {
      throw new Error(err)
    }
  }


  /**
   * Trying to log in user.
   * 
   * @param {Object} user
   * @param {Function} cookie
   * @param {Object} req Nodejs Request
   */
  static async login(user, req, res) {
    let cookieOptions = {
      signed: true,
      expires: new Date(Date.now() + COOKIE_EXPIRES),
      path: '/',
    }

    let session_key = await this.hash( randomString(32) ),
        user_id     = user.id,
        user_agent  = await this.getUserAgent(req),
        user_ip     = await this.getUserIP(req)

    try {
      let data = await db.one(`
        INSERT INTO users_sessions
        (session_key, user_id, date_login, last_access, agent, ip)
        VALUES
        ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $3, $4)
        RETURNING id
        `
      , [ session_key, user_id, user_agent, user_ip ])

      await res.cookie('user_id', user_id, cookieOptions)
      await res.cookie('user_session', session_key, cookieOptions)

      return await this.getSessionById( data.id )
    } catch (err) {
      throw new Error(err)
    }
  }


  /**
   * User log out.
   * 
   * @param {Number} user_id
   * @param {String} session_key
   * @param {Object} req Nodejs Response
   */
  static async logout(user_id, session_key, res) {
    let cookieOptions = {
      signed: true,
      path: '/',
    }

    res.clearCookie('user_id', cookieOptions);
    res.clearCookie('user_session', cookieOptions);

    try {
      await db.none(`
        DELETE FROM users_sessions
        WHERE user_id = $1 AND session_key = $2
        `
      , [ user_id, session_key ])
      
      return true
    } catch (err) {
      throw new Error(err)
    }
  }


  /**
   * Generate hash with private salt.
   * 
   * @param {String} text String to hash
   */
  static hash(text) {
    return sha512( PASSWORD_SALT + text )
  }


  /**
   * Get user ip.
   * 
   * @param {Object} req Nodejs Request
   */
  static getUserIP(req) {
    var ip = (req.headers['x-forwarded-for'] || '').split(',').pop() || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress
    return ip
  }

  /**
   * Get user agent.
   * 
   * @param {Object} req Nodejs Request
   */
  static getUserAgent(req) {
    return req.headers['user-agent']
  }
}

module.exports = Users
