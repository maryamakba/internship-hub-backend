const mongoose = require('mongoose');

const remarkSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    remarks: {
        type: String,
        required: true,
    },
    evaluation: {
        technicalSkills: String,
        taskCompletion: String,
        learningAbility: String,
        communicationSkills: String,
        teamCollaboration: String,
        punctualityAttendance: String,
        professionalism: String,
        creativityInitiative: String,
        behaviorAttitude: String,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Remark', remarkSchema);
