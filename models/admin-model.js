const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Schema, model } = require('mongoose');

const adminSchema = new Schema({
  email: {
    lowercase: true,
    required: true,
    trim: true,
    type: String,
    unique: true
  },
  password: {
    minlength: 7,
    required: true,
    trim: true,
    type: String
  },
  sessions: [String]
}, {
  timestamps: true
});

adminSchema.methods.generateAuthenticationToken = async function () {
  const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET);
  this.sessions = this.sessions.concat(token);
  await this.save();
  return token;
};

adminSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

adminSchema.statics.findByCredentials = async function (email, enteredPassword) {
  const admin = await this.findOne({ email })

  if (!admin) {
    throw new Error('The provided email address and/or password were incorrect.  Please try again.');
  }

  const isMatch = await bcrypt.compare(enteredPassword, admin.password);

  if (!isMatch) {
    throw new Error('The provided email address and/or password were incorrect.  Please try again.');
  }

  return admin;
};

const Admin = model('Admin', adminSchema);

module.exports = Admin;