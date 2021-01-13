var express = require('express')
var router  = express.Router()
var multer  = require('multer')
var path    = require('path')
var fs      = require('fs')
var dateformat = require('dateformat');

const Media = require('../../../models/media')

const temp_dir = path.resolve('./tmp')
const uploads_dir = path.resolve('./public/uploads')

var upload = multer({ dest: temp_dir })

// Upload files
router.post('/upload', upload.single('file'), function(req, res, next) {
  if (!req.user || !req.user.is_admin()) {
    res.json({
      success: false,
      message: 'You do not have permissions.',
    })
    return
  }

  console.log( path.extname( req.file.originalname ) );

  // Check file mimetype
  if (!Media.isFileCorrect(req.file)) {
    fs.unlinkSync(req.file.path)
    res.json({
      success: false,
      message: 'File is incorrect.',
    })
    return
  }

  let _date = new Date
  let date = dateformat(_date, 'yyyy') + '/' + dateformat(_date, 'mm')

  // Create /public/uploads/{1970/01} folder
  let dir = uploads_dir + '/' + date + '/'
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  var filename = Media.prepareFilename(req.file.originalname)
  var fileinfo = Media.parseFilename(filename)
  var filepath = fileinfo.filename + '.' + fileinfo.extension
  var current_index = 0

  /**
   * Generate uniq filename.
   * @example orig_filename_123.ext
   */
  while (fs.existsSync( dir + filepath )) {
    current_index++
    filepath = fileinfo.filename + '_' + current_index + '.' + fileinfo.extension
  }

  // Move file to public folder
  fs.renameSync( req.file.path, dir + filepath )

  let host = req.protocol + '://' + req.headers.host
  let url = host + '/uploads/' + date + '/' + filepath

  // Create entry in db
  Media.uploaded({
    user_id: req.user.id,

    name: req.file.originalname,
    size: req.file.size,
    type: req.file.mimetype,

    url: url
  })
    .then(file => {
      res.json({
        success: true,
        file: file,
      })
    })
    .catch( err => {
      res.json({
        success: false,
        message: err.message,
      })
    })
})


module.exports = router
