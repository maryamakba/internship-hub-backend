const Profile =  require('../models/profileModel');

exports.createProfile =  async (req, res) => {
    try {
        const{ studentId, phone, program, university, skill, linkedin} = req.body;
        const profileImage = req.file ? req.file.path :'';
        const existProfile = await Profile.findOne({ studentId: studentId });
        if (existProfile) {
            const profile = await Profile.findByIdAndUpdate(existProfile._id,{phone, program, university, skill, linkedin, profileImage },{ new: true});
            res.json(profile);
        }else{
            const profile =  new Profile({
                studentId, phone, program, university, skill, linkedin, profileImage
            });
            await profile.save();
            res.status(201).json(profile);
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to save profile', error: error.message});
    }
};

// Get all profiles
exports.getProfiles = async(req, res)=> {
    try {
        const profiles =  await Profile.find();
        res.json(profiles);
    } catch (error) {
        res.status(500).json({message: 'Failed to fetch profiles', error: error.message});
    }
};