const jwt = require('jsonwebtoken');

const Admin = require('../models/admin-model');

async function authorization (req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        throw new Error('You must be logged in to perform this action.');
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findOne({ _id: decodedToken._id, sessions: token });
    if (!admin) {
        throw new Error('You are do not have permission to perform the requested action.');
    } else {
        req.admin = admin;
    }
    next();
  } catch (error) {
      res.status(401).json({ message: error.message });
  }
}

module.exports = authorization;