const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Make title required
  },
  description: {
    type: String,
    required: true, // Make description required
  },
  deadline: {
    type: Date,
    required: true,
    set: (value) => {
      // Ensure the date string is converted to a valid Date object
      if (typeof value === "string") {
        return new Date(value);
      }
      return value;
    },
  },
  answer: String,

  // Allow multiple students to be assigned to this task
  studentId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],

  status: {
    type: Number,
    default: 0, // 0 = Pending, 1 = In Progress, 2 = Completed
  },
  file: {
    fileName: {
      type: String,
      default: null,
    },
    filePath: {
      type: String,
      default: null,
    },
  },

  assignBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "softwarehouses",
  },

  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Task", taskSchema);
