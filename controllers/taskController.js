const Task = require("../models/taskModel");
const Application = require("../models/applicationModel");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// Get all tasks
const getTask = async (req, res) => {
  try {
    const { companyId } = req.params; // Extract companyId from request params
    const filter = companyId
      ? { assignBy: new mongoose.Types.ObjectId(companyId) }
      : null;
    // const task = await Task.find({ status: 1});
    const tasks = await Task.aggregate([
      {
        $match: filter, // Apply the filter (either specific companyId or all)
      },
      {
        $lookup: {
          from: "users", // MongoDB collection name (lowercase plural of 'Company')
          localField: "studentId", // Field in Task
          foreignField: "_id", // Field in Company
          as: "std", // Output array field
        },
      },
      {
        $unwind: "$std", // Deconstruct the array to a single object
      },
      {
        $project: {
          studentId: 1,
          title: 1,
          description: 1,
          deadline: 1,
          status: 1,
          answer: 1,
          file: 1,
          "std.name": 1,
          "std.email": 1,
        },
      },
    ]);
    console.log(tasks);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStdTask = async (req, res) => {
  try {
    const tasks = await Task.find({ studentId: req.params.id });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTask = async (req, res) => {
  const { title, description, deadline, studentId, status, assignBy } =
    req.body;
  try {
    // Validate date format
    if (!deadline || isNaN(Date.parse(deadline))) {
      return res
        .status(400)
        .json({ message: "Invalid date format for deadline" });
    }
    const newRecord = new Task({
      title,
      description,
      deadline: new Date(deadline),
      studentId,
      status,
      assignBy,
    });
    await newRecord.save();
    console.log("saved task: ", newRecord);
    res.status(200).json(newRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Upodate record
const updateTask = async (req, res) => {
  const { title, description, deadline, studentId } = req.body;

  try {
    // Validate date format
    if (!deadline || isNaN(Date.parse(deadline))) {
      return res
        .status(400)
        .json({ message: "Invalid date format for deadline" });
    }

    const app = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, deadline: new Date(deadline), studentId },
      { new: true }
    );
    if (!app) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: "Error updating Task", error });
  }
};

// Delete record
const deleteTask = async (req, res) => {
  try {
    const app = await Task.findByIdAndDelete(req.params.id);
    if (!app) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting Task:", error);
    res.status(500).json({ message: "Error deleting Task", error });
  }
};

// Apply for an Task
const submitTask = async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;
  const { answer } = req.body;
  try {
    if (!id) {
      return res.status(400).json({ message: "Task ID is required" });
    }
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }
    const taskExist = await Task.findOne({ _id: id, studentId: studentId });
    if (!taskExist) {
      return res.status(200).json({ message: "This task is not exist" });
    }
    const app = await Task.findByIdAndUpdate(
      req.params.id,
      { answer, status: 1 },
      { new: true }
    );
    res.status(200).json({ message: `You have submit '${Task.title}' Task` });
    // res.status(200).json({ message: `Student ${studentId} applied for Task ${id}` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get tasks assigned to students by a specific company (software house)
const getTasksByCompany = async (req, res) => {
  const { companyId } = req.params;

  try {
    // Validate if companyId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid company ID format" });
    }

    const tasks = await Task.aggregate([
      { $match: { assignBy: new mongoose.Types.ObjectId(companyId) } },
      {
        $lookup: {
          from: "users", // User collection for student details
          localField: "studentId",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      { $unwind: "$studentDetails" },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          deadline: 1,
          status: 1,
          "studentDetails.name": 1,
          "studentDetails.email": 1,
        },
      },
    ]);
    console.log(tasks);

    res.status(200).json(tasks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch tasks", error: error.message });
  }
};

// Update task status (mark as Pending, In Progress, or Completed)
const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update task status", error: error.message });
  }
};

const submitFile = async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log(req.file);

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    const newid = await Task.findById(taskId).populate("assignBy");

    const pdfUpload = await Task.findByIdAndUpdate(taskId, {
      file: {
        fileName: req.file.originalname,
        filePath: req.file.path,
      },
      status: 2,
    });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "shamraj8028@gmail.com", // your email
        pass: "zzkq sjgk ojdj ngoc", // your password or app password
      },
    });
    console.log("mailing to", newid?.assignBy?.email);

    const mailOptions = {
      from: "shamraj8028@gmail.com",
      to: newid?.assignBy?.email,
      subject: "Application For internship program",
      text: `
          Hello,
          Student Has Completed The Task
          Regards,
          Internship-Hub
              `,
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("Mail result:", result);
    res
      .status(200)
      .json({ success: true, file: req.file.originalname, data: pdfUpload });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTask,
  addTask,
  updateTask,
  deleteTask,
  getStdTask,
  submitTask,
  getTasksByCompany,
  updateTaskStatus,
  submitFile,
};
