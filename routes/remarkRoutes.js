// const express = require('express');
// const router = express.Router();
// const Remark = require('../models/remarksModel');


// router.get('/student/:studentId', async (req, res) => {
      
//     const { studentId } = req.params;   

//     try {
//         const remarks = await Remark.find({ studentId });
//         if (!remarks) {
//             return res.status(404).json({ message: 'No remarks found for this student' });
//         }
//         res.json(remarks);

//     } catch (error) {
//         console.error('Error saving remarks:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // POST /api/remarks/:studentId
// router.post('/:studentId', async (req, res) => {
//   const { studentId } = req.params;
//   const { remarks, evaluation } = req.body;

//   try {
//     const newRemark = new Remark({
//       studentId,
//       remarks,
//       evaluation,
//     });

//     const savedRemark = await newRemark.save();
//     res.status(201).json(savedRemark);
//   } catch (error) {
//     console.error('Error saving remark:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const Remark = require('../models/remarksModel');

// POST /api/remarks/:studentId
router.post('/:studentId', async (req, res) => {
    const { remarks, evaluation } = req.body;
    const { studentId } = req.params;



    if (!remarks || !evaluation) {
        return res.status(400).json({ message: 'Remarks and evaluation are required.' });
    }

    try {
        const newRemark = new Remark({
            studentId,
            remarks,
            evaluation,
        });

        await newRemark.save();
        res.status(201).json({ message: 'Remarks saved successfully', remark: newRemark });
    } catch (error) {
        console.error('Error saving remarks:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/student/:studentId', async (req, res) => {
      
    const { studentId } = req.params;   

    try {
        const remarks = await Remark.find({ studentId });
        if (!remarks) {
            return res.status(404).json({ message: 'No remarks found for this student' });
        }
        res.json(remarks);

    } catch (error) {
        console.error('Error saving remarks:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;
