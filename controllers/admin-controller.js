const Admin = require('../models/admin-model');

async function logIn (req, res, next) {
  try {
    const admin = await Admin.findByCredentials(req.body.email, req.body.password);
    const token = await admin.generateAuthenticationToken();
    res.status(200).header('Authorization', `Bearer ${token}`).json({ adminId: admin._id, token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
}

async function logOut (req, res, next) {
  try {
    req.admin.sessions = [];
    await req.admin.save();
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// not allowing users to create admin accounts
async function register (req, res, next) {
  const { email, password } = req.body;
  const admin = new Admin({ email, password });
  try {
    await admin.save();
    const token = await admin.generateAuthenticationToken();
    res.status(201).header('Authorization', `Bearer ${token}`).json({ adminId: admin._id, token });
  } catch(error) {
    res.status(401).json({ message: error.message });
  }
}

module.exports = {
  logIn,
  logOut,
  register
}