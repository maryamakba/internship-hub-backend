const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'softwarehouses' },
  description: String,
  duration: String,
  type: String,
  deadline: { 
    type: Date, 
    set: (value) => {
      if (typeof value === 'string') {
        return new Date(value);
      }
      return value;
    }
  },
  status: { type: Number, default: 0},
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  dateCreated: { type: Date, default: Date.now },
  image: { type: String, default: null } 
});

module.exports = mongoose.model('internships', internshipSchema);
