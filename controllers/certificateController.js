const Certificate = require('../models/certificateModel');
const Student = require('../models/userModel'); // Assuming you have a Student model
const { generateCertificatePDF } = require('../utils/certificateUtils'); // PDF generation utility

// Create a certificate for a student
exports.createCertificate = async (req, res) => {
  const { studentId, remarks, evaluation } = req.body;

  try {
    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Generate the certificate (for example, a PDF)
    const certificateLink = await generateCertificatePDF(student, remarks, evaluation);

    // Create the certificate entry in the database
    const certificate = new Certificate({
      studentId,
      remarks,
      evaluation,
      certificateLink,
    });

    // Save the certificate in the database
    await certificate.save();

    res.status(201).json({ message: 'Certificate generated and saved successfully.', certificate });
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({ message: 'Failed to generate certificate' });
  }
};

// Retrieve a certificate for a student
exports.getCertificate = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Retrieve the certificate from the database
    const certificate = await Certificate.findOne({ studentId }).populate('studentId', 'name');
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.status(200).json({ certificate });
  } catch (error) {
    console.error('Error retrieving certificate:', error);
    res.status(500).json({ message: 'Failed to retrieve certificate' });
  }
};
