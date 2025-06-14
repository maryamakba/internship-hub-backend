const Internship = require("../models/internshipModel");
const Application = require("../models/applicationModel");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");

// Set up Multer storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../frontend/src/assets/images")); // Define your image folder path
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Ensure unique filenames
  },
});

const upload = multer({ storage });

// Get all internships, optionally filter by companyId
const getInternships = async (req, res) => {
  const { companyId } = req.params;
  const filter = companyId
    ? { companyId: new mongoose.Types.ObjectId(companyId) }
    : {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const internships = await Internship.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "softwarehouses", // Assuming 'softwarehouses' is the collection where company details are stored
          localField: "companyId",
          foreignField: "_id",
          as: "companyDetails",
        },
      },
      { $unwind: "$companyDetails" },
      {
        $project: {
          companyId: 1,
          title: 1,
          description: 1,
          duration: 1,
          type: 1,
          deadline: 1,
          status: 1,
          image: 1, // Include image in response
          "companyDetails.name": 1,
          "companyDetails.location": 1,
        },
      },
    ]);
    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get internships by company ID
const getByCompanyid = async (req, res) => {
  try {
    const { companyId } = req.params;

    const internships = await Internship.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
      {
        $lookup: {
          from: "softwarehouses",
          localField: "companyId",
          foreignField: "_id",
          as: "companyDetails",
        },
      },
      { $unwind: "$companyDetails" },
      {
        $project: {
          companyId: 1,
          title: 1,
          description: 1,
          type: 1,
          deadline: 1,
          status: 1,
          image: 1,
          "companyDetails.name": 1,
          "companyDetails.location": 1,
        },
      },
    ]);

    res.status(200).json(internships);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch internships by company ID" });
  }
};

// Add Internship with Image Upload
const addInternship = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err)
      return res
        .status(400)
        .json({ message: "Image upload failed", error: err.message });

    const {
      title,
      companyId,
      description,
      duration,
      type,
      deadline,
      status,
      postedBy,
    } = req.body;
    const imagePath = req.file ? `${req.file.filename}` : null;

    try {
      if (!deadline || isNaN(Date.parse(deadline))) {
        return res.status(400).json({ message: "Invalid date format for deadline" });
      }

      const newRecord = new Internship({
        title,
        companyId,
        description,
        duration,
        type,
        deadline: new Date(deadline),
        status,
        postedBy,
        image: imagePath,
      });

      await newRecord.save();
      res.status(200).json(newRecord);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};

// Update Internship with Image Upload
const updateInternship = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err)
      return res
        .status(400)
        .json({ message: "Image upload failed", error: err.message });

    const { title, companyId, description, duration, type, deadline, status } = req.body;
    const imagePath = req.file ? `${req.file.filename}` : undefined; // Only update if new image is uploaded

    try {
      if (!deadline || isNaN(Date.parse(deadline))) {
        return res.status(400).json({ message: "Invalid date format for deadline" });
      }

      const updateData = {
        title,
        companyId,
        description,
        duration,
        type,
        deadline: new Date(deadline),
        status,
      };
      if (imagePath) updateData.image = imagePath; // Add image only if provided

      const internship = await Internship.findByIdAndUpdate(req.params.id, updateData, { new: true });

      if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
      }

      res.json(internship);
    } catch (error) {
      res.status(500).json({ message: "Error updating internship", error });
    }
  });
};

// Delete Internship
const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.json({ message: "Internship deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting internship", error });
  }
};

// Apply for Internship
const applyInternship = async (req, res) => {
  const { id } = req.params;
  const { studentId, name, email, phone, university, degree, skills, coverLetter } = req.body;

  if (!name || !email || !phone || !university || !degree || !skills || !coverLetter) {
    return res.status(400).json({ message: "All Fields Are Required" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Resume is Required" });
  }

  try {
    if (!id || !studentId) {
      return res.status(400).json({ message: "Internship ID and Student ID are required" });
    }

    const appExist = await Application.findOne({ internshipId: id, studentId });
    if (appExist) {
      return res.status(200).json({ message: "You have already applied for this internship" });
    }

    const internship = await Internship.findById(id).populate("companyId");

    const newRecord = new Application({
      internshipId: id,
      studentId,
      details: req.body.details,
      studentDetails: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        university: req.body.university,
        degree: req.body.degree,
        skills: req.body.skills,
        resume: {
          fileName: req.file.originalname,
          filePath: req.file.path,
        },
        coverLetter: req.body.coverLetter,
      },
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "shamraj8028@gmail.com", // your email
        pass: "zzkq sjgk ojdj ngoc", // your password or app password
      },
    });

    const mailOptions = {
      from: "shamraj8028@gmail.com",
      to: internship?.companyId?.email,
      subject: "Application For internship program",
      text: `
        Hello,

        Student ${req.body.name} (${req.body.email}) has applied for the position of Internship.

        Please reach out to them directly at ${req.body.email}.
        
        Regards,  
        Job Portal Team
      `,
    };

    const result = await transporter.sendMail(mailOptions);

    await newRecord.save();

    res.status(200).json({
      message: `You have applied for ${internship.title} internship successfully`,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// GET students registered for an internship
const getregstd = async (req, res) => {
  try {
    // First verify the internship exists
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Find all approved applications for this internship
    const applications = await Application.find({ 
      internshipId: req.params.id,  // Changed from 'internship' to 'internshipId' to match your schema
      status: 1  // Changed to use numeric status (1 = approved) to match your enum [0,1,2]
    }).populate({
      path: 'studentId',  // Changed from 'student' to 'studentId' to match your schema
      select: 'name email phone university skills', // Select student fields you need
      model: User
    });

    // Extract and format student data
    const students = applications.map(app => {
      // Use studentDetails if populated student is not available
      const student = app.studentId || app.studentDetails;
      
      return {
        _id: student._id || app._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        university: student.university,
        skills: student.skills,
        applicationDate: app.dateCreated,
        applicationStatus: app.status,
        resume: app.studentDetails?.resume,
        coverLetter: app.studentDetails?.coverLetter
      };
    });

    res.json(students);
  } catch (err) {
    console.error('Error in getregstd:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



module.exports = {
  getInternships,
  addInternship,
  updateInternship,
  deleteInternship,
  getByCompanyid,
  applyInternship,
  getregstd,
};
