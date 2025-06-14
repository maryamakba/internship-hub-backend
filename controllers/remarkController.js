// controllers/remarkController.js

const Remark = require('../models/remarksModel');
const submitRemarks = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!studentId) {
            return res.status(400).json({ error: 'Student ID is required in URL params' });
        }

        const { remarks, evaluation } = req.body;

        const newRemark = new Remark({
            studentId,
            remarks,
            evaluation,
            submittedAt: new Date(),
        });

        await newRemark.save();
        res.status(200).json({ message: 'Remarks submitted successfully' });
    } catch (error) {
        console.error('Error in submitRemarks:', error);
        res.status(500).json({ error: 'Failed to submit remarks' });
    }
};

module.exports = {
    submitRemarks,
};
