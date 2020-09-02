const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const fileUpload = multer({
  storage: multerS3({
    acl: 'public-read',
    bucket: process.env.AWS_BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    s3
  })
});

module.exports = fileUpload;