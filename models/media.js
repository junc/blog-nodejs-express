var path = require('path')
const db = require('../configs/database')


const ALLOW_MIMETYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',

  // coming soon
]

const ALLOW_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif',
]

// In bytes
// 1048576 - 1Mb
// 30 Mb
const MAX_FILESIZE = 1048576 * 30

class Media
{
  static getAllowedMimetypes() {
    return ALLOW_MIMETYPES
  }
  static getAllowedExtensions() {
    return ALLOW_EXTENSIONS
  }

  static prepareFilename( filename ) {
    filename = filename.replace(/^\.+/g, '')
    filename = filename.replace(/\s+/g, '_')
    filename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '')

    return filename
  }

  static parseFilename( filename ) {
    let extension = this.getExtension( filename )
    let name      = path.basename( filename, '.' + extension )

    let result = {
      filename: name,
      extension: extension,
    }
    return result
  }

  static isFileCorrect( file ) {
    let ext  = this.getExtension( file.originalname )
    let mime = file.mimetype
    let size = file.size

    if (ALLOW_MIMETYPES.contains( mime )) {
      return false
    }

    if (ALLOW_EXTENSIONS.contains( ext )) {
      return false
    }

    if (size < 8 || size > MAX_FILESIZE) {
      return false
    }

    return true
  }

  static getExtension( filename ) {
    return path.extname( filename ).replace('.', '')
  }


  /**
   * Create entry in table.
   * 
   * @param {Object} params { user_id, name, size, type, url }
   */
  static async uploaded(params) {
    try {
      let data = await db.one(`
          INSERT INTO media
          (date_uploaded, user_id, type, name, size, url)
          VALUES
          (CURRENT_TIMESTAMP, $1, $2, $3, $4, $5)
          RETURNING id
          `
        , [ params.user_id, params.type, params.name, params.size, params.url ])
      return await this.get( data.id )
    } catch (err) {
      throw new Error(err)
    }
  }

  /**
   * Get media by ID.
   * 
   * @param {Number} media_id 
   */
  static async get(media_id) {
    try {
      const media = await db.one('SELECT * FROM media WHERE id = $1', [media_id])
      return media
    } catch (err) {
      throw new Error(err)
    }
  }
}


module.exports = Media
