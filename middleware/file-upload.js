const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');

const MIME_TYPE_MAP = {
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/png": "png"
}

const fileUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join('uploads', 'images'));
    },
    filename: function (req, file, cb) {
      const extension = MIME_TYPE_MAP[file.mimetype];
      cb(null, `${uuid()}.${extension}`);
    }
  }),
  fileFilter: function (req, file, cb) {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid mime type!');
    cb(error, isValid);
  }
});

module.exports = fileUpload;