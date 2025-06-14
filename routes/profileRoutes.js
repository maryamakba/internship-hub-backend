const express =  require('express');
const multer =  require('multer');
const path =  require('path');
const { createProfile, getProfiles } = require('../controllers/profileController');
const Student = require('../models/userModel');
const Profile = require('../models/profileModel');


const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: ( req, file, cb) =>{
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const fileFilter= ( req, file, cb)=>{
    const fileType = /jpeg|jpg|png/;
    const extname =  fileType.test(path.extname(file.originalname).toLowerCase());
    const mimetype =  fileType.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }else{
        cb('Error: Images only!');
    }
}

const upload = multer({ storage, fileFilter });

router.post('/', upload.single('profileImage'), createProfile);
router.get('/', getProfiles);


router.get('/student/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student profile' });
  }
});
// routes/profiles.js

router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ studentId: req.params.id }).select('-password');

    if (!profile) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching student profile:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

router.put('/student/:id', upload.single('profileImage'), async (req, res) => {
  try {
    const updatedProfile = await Student.findByIdAndUpdate(req.params.id, {
      phone: req.body.phone,
      program: req.body.program,
      university: req.body.university,
      skill: req.body.skill,
      linkedin: req.body.linkedin,
      profileImage: req.file ? req.file.path : undefined, // Save file path if an image was uploaded
    }, { new: true });

    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


module.exports = router;
