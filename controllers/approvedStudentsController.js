const Application = require('../models/applicationModel');
const mongoose = require('mongoose');

// Get Approved Students for a Specific Software House (Company)
const getApprovedStudents = async (req, res) => {
  const { companyId } = req.params;

  try {
    // Check if companyId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      console.log("Invalid company ID format:", companyId);
      return res.status(400).json({ message: 'Invalid company ID format' });
    }

    console.log("Fetching approved applications for companyId:", companyId);

    // Fetch approved applications with aggregation
    const approvedApplications = await Application.aggregate([
      { 
        $match: { 
          companyId: new mongoose.Types.ObjectId(companyId), 
          status: 1 // 1 = Approved
        } 
      },
      {
        $lookup: {
          from: 'internships',
          localField: 'internshipId',
          foreignField: '_id',
          as: 'internship',
        },
      },
      { $unwind: '$internship' },
      {
        $lookup: {
          from: 'users', // Join with users collection for student details
          localField: 'studentId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          'internship.title': 1,
          'internship.type': 1,
          'user.name': 1,
          'user.email': 1,
          'user.phone': 1,
          'internship.companyId': 1
        }
      },
    ]);

    // Check if no applications found
    if (!approvedApplications || approvedApplications.length === 0) {
      console.log("No approved applications found for companyId:", companyId);
      return res.status(404).json({ message: 'No approved students found' });
    }

    console.log("Approved applications:", approvedApplications);
    res.status(200).json(approvedApplications); // Return the result as JSON
  } catch (error) {
    console.error("Error in fetching approved students:", error);
    res.status(500).json({ message: 'Failed to fetch approved students', error: error.message });
  }
};

module.exports = { getApprovedStudents };
