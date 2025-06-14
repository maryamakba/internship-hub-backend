const express = require("express");
const {
  getInternships,
  getByCompanyid,
  applyInternship,
  addInternship,
  updateInternship,
  deleteInternship,
  getregstd,
} = require("../controllers/internshipController");
const Internship = require("../models/internshipModel");
const Application = require("../models/applicationModel");
const multer = require("multer");
const router = express.Router();
const path = require("path");

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

router.get("/:companyId?", getInternships);
router.post("/", addInternship);
router.put("/:id", updateInternship);
router.delete("/:id", deleteInternship);

router.get("/softhouse/:id", getByCompanyid);
router.post("/:id/apply", uploadPDF.single("file"), applyInternship);
router.get("/:id/students", getregstd);
router.get("/status-distribution/:companyId", );



router.get('/approved/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const approvedApplications = await Application.find({
      studentId: studentId,
      status: 1, // Approved
    })
    .populate({
      path: 'internshipId',
      model: 'internships', // Make sure the model name matches
      select: 'title description duration type deadline status image companyId',
      populate: {
        path: 'companyId',
        model: 'softwarehouses', // Match the name used when defining the model
        select: 'name email'
      }
    });

    const internships = approvedApplications.map(app => {
      const internship = app.internshipId;
      if (!internship) return null;

      return {
        _id: internship._id,
        title: internship.title,
        description: internship.description,
        duration: internship.duration,
        type: internship.type,
        deadline: internship.deadline,
        status: internship.status,
        image: internship.image,
        company: internship.companyId ? {
          _id: internship.companyId._id,
          name: internship.companyId.name,
          email: internship.companyId.email
        } : null,
        applicationDate: app.dateCreated,
        applicationStatus: app.status
      };
    }).filter(internship => internship !== null); // filter out nulls

    res.json({
      success: true,
      count: internships.length,
      internships: internships
    });

  } catch (err) {
    console.error('Error fetching approved internships:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});




// GET: All internships a student has applied to (approved or pending)
router.get('/applied-internships/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Pagination setup
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter for pending (0) and approved (1) applications
    const filter = {
      studentId,
      status: { $in: [0, 1] } 
    };

    // Sorting setup
    const sortBy = req.query.sortBy || '-dateCreated'; // Use correct field name from schema

    // Fetch applications with populated internship and company details
    const applications = await Application.find(filter)
      .populate({
        path: 'internshipId',
        model: 'internships',
        select: 'title description duration type deadline status image companyId',
        populate: {
          path: 'companyId',
          model: 'softwarehouses',
          select: 'name email logo'
        }
      })
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    // Count total applications
    const total = await Application.countDocuments(filter);

    // Format and return data
    const formattedData = applications.map(app => {
      const internship = app.internshipId;
      const company = internship?.companyId;

      return {
        applicationId: app._id,
        status: app.status, // 0 = pending, 1 = approved
        appliedDate: app.dateCreated, // Use correct date field
        internship: internship ? {
          id: internship._id,
          title: internship.title,
          description: internship.description,
          duration: internship.duration,
          type: internship.type,
          deadline: internship.deadline,
          status: internship.status,
          image: internship.image,
          company: company ? {
            id: company._id,
            name: company.name,
            email: company.email,
            logo: company.logo
          } : null
        } : null
      };
    });

    res.json({
      success: true,
      count: formattedData.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      applications: formattedData
    });

  } catch (err) {
    console.error('Error in /applied-internships route:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applied internships'
    });
  }
});





// Configure multer for file uploads

const upload = multer({ storage });

router.post('/internships/:id/apply', upload.single('file'), async (req, res) => {
  try {
    const { studentId, name, email, phone, university, degree, skills } = req.body;
    const internshipId = req.params.id;

    const application = new Application({
      studentId,
      internshipId,
      softwareHouseId: req.body.softwareHouseId, // Adjust based on your logic
      status: 0,
      studentDetails: {
        name,
        email,
        phone,
        university,
        degree,
        skills,
        resume: req.file
          ? {
              fileName: req.file.originalname,
              filePath: `uploads/${req.file.filename}`,
            }
          : null,
      },
    });

    await application.save();
    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error saving application:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});



module.exports = router;
