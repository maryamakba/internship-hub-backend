const express = require('express');
const router = express.Router();
const { getApprovedStudents } = require('../controllers/approvedStudentsController');

// Route to get approved students for a specific software house (companyId)
router.get('/approved/:companyId', getApprovedStudents);
// Assuming you're using Express.js for your backend

app.get('/api/approved/:companyId', async (req, res) => {
    const { companyId } = req.params;
  
    try {
      // Fetch only approved applications (status === 1)
      const approvedApplications = await Application.find({ companyId, status: 1 });
  
      res.json(approvedApplications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching approved applications' });
    }
  });
  
module.exports = router;
