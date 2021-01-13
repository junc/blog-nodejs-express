const db = require('../configs/database')

/**
 * Fields:
 * 
 * integer      ID
 * varchar(255) url
 * datetime     created_date
 * varchar(255) title
 * TEXT         content
 * SET          status (draft, public, trash)
*/

class Pages
{
  /**
   * Get page by URL path.
   * 
   * @param {Number} page_url
   */
  static async get(page_url) {
    const mysql = db.promise()

    const [rows, fields1] = await mysql.query('SELECT * FROM pages WHERE url = ? LIMIT 1', [ page_url ])
    return rows[0]
  }
}

module.exports = Pages
