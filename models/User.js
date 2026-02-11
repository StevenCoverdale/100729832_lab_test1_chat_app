const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  createdon: {
    type: String,
    default: () => new Date().toLocaleString()
  }
});

module.exports = mongoose.model('User', UserSchema);