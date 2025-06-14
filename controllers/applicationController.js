const Application = require("../models/applicationModel");
const mongoose = require("mongoose");

// Get all records
// const getApps = async (req, res) => {
//   try {
//     const { companyId } = req.params;
//     const filter = companyId ? new mongoose.Types.ObjectId(companyId) : null;

//     const apps2 = await Application.aggregate([
//       {
//         $lookup: {
//           from: "internships",
//           localField: "internshipId",
//           foreignField: "_id",
//           as: "internship",
//         },
//       },
//       { $unwind: "$internship" },
//       ...(filter ? [{ $match: { "internship.companyId": filter } }] : []),
//       {
//         $lookup: {
//           from: "users",
//           localField: "studentId",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       { $unwind: "$user" },
//       {
//         $project: {
//           internshipId: 1,
//           studentId: 1,
//           status: 1,
//           "internship.title": 1,
//           "internship.type": 1,
//           "internship.companyId": 1,
//           "user.name": 1,
//           "user.email": 1,
//           "user.phone": 1,
//         },
//       },
//     ]);

//     // console.log("Aggregated Data:", JSON.stringify(apps2, null, 2));
//     res.json(apps2);
//   } catch (err) {
//     console.error("Error fetching applications:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

const getApps = async (req, res) => {
  try {
    const { companyId } = req.params;
    const filter = companyId ? new mongoose.Types.ObjectId(companyId) : null;

    const apps2 = await Application.aggregate([
      {
        $lookup: {
          from: 'internships',
          localField: 'internshipId',
          foreignField: '_id',
          as: 'internship',
        },
      },
      { $unwind: '$internship' },
      ...(filter ? [{ $match: { 'internship.companyId': filter } }] : []),
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          internshipId: 1,
          studentId: 1,
          status: 1,
          'internship.title': 1,
          'internship.type': 1,
          'internship.companyId': 1,
          'user.name': 1,
          'user.email': 1,
          'user.phone': 1,
          'studentDetails.resume': 1, // Include resume object with fileName and filePath
        },
      },
    ]);

    res.json(apps2);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ message: err.message });
  }
};
// Add a new record
const addApp = async (req, res) => {
  try {
    // console.log(req.body);

    const newRecord = new Application(req.body);
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Upodate record
const updateApp = async (req, res) => {
  const { applicant, internship, status } = req.body;

  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { applicant, internship, status },
      { new: true }
    );
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: "Error updating application", error });
  }
};

const updateStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
};
// Delete record
const deleteApp = async (req, res) => {
  try {
    const app = await Application.findByIdAndDelete(req.params.id);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ message: "Error deleting application", error });
  }
};
// report
const reportApp = async (req, res) => {
  try {
    const { studentId } = req.params;

    // console.log('studentId:', studentId);

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: 'Invalid studentId format' });
    }

    const result = await Application.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId)
        }
      },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          acceptedApplications: {
            $sum: {
              $cond: [{ $eq: ["$status", 1] }, 1, 0]
            }
          },
          rejectedApplications: {
            $sum: {
              $cond: [{ $eq: ["$status", 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json(result[0] || { totalApplications: 0, acceptedApplications: 0, rejectedApplications: 0 });
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: err.message });
  }
};


const approvedstd = async (req, res) =>  {
  try {
    // Validate companyId
    if (!mongoose.Types.ObjectId.isValid(req.params.softwareHouseId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }

    // Count approved applications (status: 1)
    const count = await Application.countDocuments({
      softwareHouseId: req.params.softwareHouseId,
      status: 1 // 1 represents approved status in your schema
    });

    res.json({ 
      success: true,
      count 
    });
  } catch (err) {
    console.error('Error fetching approved applications:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching approved applications' 
    });
  }
};


module.exports = { getApps, addApp, updateApp, updateStatus, deleteApp, reportApp,approvedstd };
