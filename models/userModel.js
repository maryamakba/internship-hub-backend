const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'softwareHouse', 'admin'], required: true },
  status: { type: Number, default: 0},
  dateCreated:  { type: Date, default: Date.now}
});

module.exports = mongoose.model('users', userSchema);
