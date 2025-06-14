const jsPDF = require('jspdf');
const path = require('path');
const fs = require('fs');

// Function to generate the certificate PDF
exports.generateCertificatePDF = async (student, remarks, evaluation) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Certificate of Completion", 20, 20);
  doc.setFontSize(12);
  doc.text(`This is to certify that ${student.name} has successfully completed the internship.`, 20, 40);
  doc.text(`Remarks: ${remarks}`, 20, 50);
  
  doc.text("Evaluation:", 20, 60);
  doc.text(`Technical Skills: ${evaluation.technicalSkills}`, 20, 70);
  doc.text(`Task Completion: ${evaluation.taskCompletion}`, 20, 80);
  doc.text(`Learning Ability: ${evaluation.learningAbility}`, 20, 90);
  // Add more fields as needed

  // Save the PDF to the server (you can use any storage method here, for example, a cloud service or local storage)
  const certificatePath = path.join(__dirname, '..', 'certificates', `${student.name}_certificate.pdf`);
  doc.save(certificatePath);

  // Return the path or URL to the certificate PDF
  return certificatePath;
};
