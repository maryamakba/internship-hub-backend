const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

// Route to generate a certificate for a student
router.post('/generate/:studentId', certificateController.createCertificate);

// Route to fetch a student's certificate
router.get('/certificate/:studentId', certificateController.getCertificate);

module.exports = router;
