const express = require("express");
const {
  getTask,
  addTask,
  updateTask,
  deleteTask,
  getStdTask,
  submitTask,
  getTasksByCompany,
  updateTaskStatus,
  submitFile,
} = require("../controllers/taskController");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const pdfFileFilter = (req, file, cb) => {
  const fileType = /pdf/;
  const extname = fileType.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileType.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb("Error: Only PDF files are allowed!");
  }
};

const uploadPDF = multer({ storage, fileFilter: pdfFileFilter });

router.get("/:companyId?", getTask);
router.post("/", addTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

router.get("/student/:id", getStdTask);
router.route("/uploadpdf/:taskId").patch(uploadPDF.single("file"), submitFile);

// Route to get tasks assigned to students by a software house (companyId)
router.get("/tasks/:companyId", getTasksByCompany);

// Route to update task status (In Progress, Completed, Pending)
router.route("/tasks/:taskId").patch(updateTaskStatus);
// Assuming the "status" field is in "studentId" to identify approved students
router.get("/tasks/:companyId", async (req, res) => {
  try {
    const tasks = await Task.find({ companyId: req.params.companyId })
      .populate("studentId") // Assuming studentId references the student model
      .exec();
    // Filter tasks assigned to approved students
    const approvedTasks = tasks.filter((task) => task.studentId.status === 1);
    res.json(approvedTasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

module.exports = router;
