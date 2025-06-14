// const mongoose = require('mongoose');

// const profileSchema = new mongoose.Schema({
//   studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
//   phone: String,
//   profileImage: String,
//   program: String,
//   university: String,
//   skill: String,
//   linkedin: String,
//   dateCreated:  { type: Date, default: Date.now}
// });

// module.exports = mongoose.model('profile', profileSchema);

const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Changed from 'users' to 'User' (assuming your user model is named 'User')
    required: true 
  },
  phone: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: '' // Default empty string instead of undefined
  },
  program: {
    type: String,
    trim: true
  },
  university: { // Fixed typo from 'univeristy' to 'university'
    type: String,
    trim: true
  },
  skill: {
    type: String,
    trim: true
  },
  linkedin: {
    type: String,
    trim: true
  },
  dateCreated: { 
    type: Date, 
    default: Date.now,
    immutable: true // Prevents modification after creation
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Corrected the export statement
module.exports = mongoose.model('Profile', profileSchema); // Capitalized model name