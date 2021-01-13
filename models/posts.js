const db = require('../configs/database')

/**
 * Fields:
 * 
 * integer      ID
 * datetime     created_date
 * varchar(255) url
 * varchar(255) category_url
 * varchar(255) title
 * TEXT         excerpt
 * TEXT         content
 * varchar(255) picture_url
 * SET          status (draft, public, trash)
*/

class Posts
{
  /**
   * Find posts by options.
   * 
   * @example Posts.find( {content: {value: 'text...', like: '%$%'} } )
   * 
   * @param {Object} options Key the same with columns in table `posts`.
   * @param {Number} limit
   * @param {Number} offset
   * @param {String} sort_key 'id'
   * @param {String} sort_type 'asc', 'desc' by default
   */
  static async find(options, { limit, offset, sort_key, sort_type }) {
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
          statements.push(`${key} BETWEEN ? AND ?`)
          values.push(value.min)
          values.push(value.max)
        }
        // LIKE
        // else if (typeof value.like !== 'undefined') {
        //   let like = value.like.replace('$', '$' + index + '#')

        //   // `{key}` LIKE '{like}'
        //   statements.push(`${key} LIKE '${like}'`)
        //   values.push(value.value)
        // }
      }
      // Single unit value
      else {
        /**
         * {key} = $N
         * @example login = $1
         */
        statements.push(`${key} = ?`)
        values.push(value)
      }
    }

    if (!offset || offset < 0) {
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

    let sortStatement = ''
    if (sort_key && ['id', 'title', 'created_date'].indexOf(sort_key) >= 0) {
      sort_type = sort_type === 'asc' ? 'asc' : 'desc'
      sortStatement = ' ORDER BY ' + sort_key + ' ' + sort_type
    }

    var count = 0
    var posts = []

    const mysql = db.promise()

    const [rows1, fields1] = await mysql.query('SELECT COUNT(id) AS count FROM posts' + statement, values)
    count = rows1[0].count

    const [rows2, fields2] = await mysql.query('SELECT * FROM posts' + statement + sortStatement + limitStatement, values);
    posts = rows2

    return { count, posts }
  }


  /**
   * Find one post by options.
   * 
   * @see Posts.find
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
   * Get post by ID.
   * 
   * @param {Number} post_id
   */
  static async get(post_id) {
    const mysql = db.promise()

    const [rows, fields1] = await mysql.query('SELECT * FROM posts WHERE url = ? LIMIT 1', [ post_id ])
    return rows[0]
  }
}

module.exports = Posts
