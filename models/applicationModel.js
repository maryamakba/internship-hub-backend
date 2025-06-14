const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: "internships" },
  status: { type: Number, enum: [0, 1, 2], default: 0 },
  details: { type: String },
  dateCreated: { type: Date, default: Date.now },
  softwareHouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SoftwareHouse",
  },
  studentDetails: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    university: { type: String },
    degree: { type: String },
    skills: { type: String },
    resume: {
      fileName: { type: String },
      filePath: { type: String },
    },
    coverLetter: {
      type: String,
    },
  },
  // status: {
  //   type: String,
  //   enum: ['pending', 'approved', 'rejected'],
  //   default: 'pending'
  // }
});

module.exports = mongoose.model("applications", applicationSchema);
