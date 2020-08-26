require('dotenv').config();

const fs = require('fs');
const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
// const session = require('express-session');
// const MongoDBtore = require('connect-mongodb-session')(session);
// const csrf = require('csurf');

const adminRouter = require('./routers/admin-router');
const orderRouter = require('./routers/order-router');
const productRouter = require('./routers/product-router');

mongoose.connect(process.env.DB_CONNECTION, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const server = express();
// const store = new MongoDBStore({
//   uri: process.env.DB_CONNECTION,
//   collection: 'sessions'
// });
// const csrfProtection = csrf();

server.use(express.json());
server.use(express.static(path.join(__dirname, 'public')));
server.use('/api/uploads/images', express.static(path.join('uploads', 'images')));
// server.use(session({
//   resave: false,
//   saveUninitialized: false,
//   secret: process.env.SECRET,
//   store
// }));
server.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, GET, PATCH, POST');
  next();
});
server.use(express.urlencoded({
  extended: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
}));
// server.use(csrfProtection);

// server.use(function (req, res, next) {
//   res.csrf_token = req.csrfToken();
//   next();
// });

server.use('/api/admin', adminRouter);
server.use('/api/order', orderRouter);
server.use('/api/product', productRouter);

server.use(function (req, res, next) {
  res.status(404).send();
});

server.use(function (error, req, res, next) {
  if (req.file) {
    fs.unlink(req.file.path, function (err) {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500).json({ message: error.message || 'An unknown error occured!' });
});

server.listen(port = process.env.PORT || 5000, function () {
    console.log(`Server is up on port ${port}.`);
});