const express = require('express');

const authorization = require('../middleware/authorization');
const {
  logIn,
  logOut,
  register
} = require('../controllers/admin-controller');

const router = new express.Router();

router.patch('/login', logIn);

router.patch('/logout', authorization, logOut);

router.post('/', register);

module.exports = router;