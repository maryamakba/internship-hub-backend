const express = require('express');
const { getApps, addApp, updateApp, updateStatus, deleteApp, reportApp, approvedstd } = require('../controllers/applicationController');
const Application = require('../models/applicationModel'); // adjust path if needed
const Student = require('../models/userModel'); 
const SoftwareHouse = require('../models/softwarehouseModel'); 
const router = express.Router();

router.get('/:companyId?', getApps);
router.post('/', addApp);
router.put('/:id', updateApp);
router.put('/status/:id', updateStatus);
router.delete('/:id', deleteApp);
router.get('/report/:studentId?', reportApp);
router.get('/approved/:softwareHouseId', approvedstd);

router.get('/applications/:companyId', async (req, res) => {
  try {
    const applications = await Application.find({ softwareHouseId: req.params.companyId })
      .populate('internshipId', 'title type')
      .populate('studentId', 'name email');
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

module.exports = router;
