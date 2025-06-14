const User = require("../models/userModel");
const SoftwareHouse = require("../models/softwarehouseModel");

// Get all records
const getSofthouse = async (req, res) => {
  try {
    const softwarehouses = await SoftwareHouse.find();
    res.json(softwarehouses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getSofthouseStatus = async (req, res) => {
  try {
    const softwarehouses = await SoftwareHouse.find({ status: req.params.id });
    res.json(softwarehouses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const softwarehouses = await SoftwareHouse.findOne({ email });
    console.log(softwarehouses);

    res.json(softwarehouses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addSofthouse = async (req, res) => {
  try {
    const { email } = req.body;
    const Exist = await SoftwareHouse.findOne({ email });
    if (Exist)
      return res
        .status(400)
        .json({ message: "This email already registered." });
    const newRecord = new SoftwareHouse(req.body);
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSofthouse = async (req, res) => {
  const { name, email, phone, location, status } = req.body;
  try {
    const record = await SoftwareHouse.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, location, status },
      { new: true }
    );
    if (!record) {
      return res.status(404).json({ message: "Softwarehouse not found" });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: "Error updating softwarehouse", error });
  }
};

const updateStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const softhouse = await SoftwareHouse.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!softhouse) {
      return res.status(404).json({ message: "Softwarehouse not found" });
    }
    await User.findOneAndUpdate(
      { email: softhouse.email },
      { status: status },
      { new: true }
    );
    res.json(softhouse);
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
};

const deleteSofthouse = async (req, res) => {
  try {
    const record = await SoftwareHouse.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Softwarehouse not found" });
    }
    res.json({ message: "Softwarehouse deleted successfully" });
  } catch (error) {
    console.error("Error deleting softwarehouse", error);
    res.status(500).json({ message: "Error deleing softwarehouse", error });
  }
};


// GET company details by ID
const getSoftwarehouse = async (req, res) =>{
  try {
    const softwarehouse = await SoftwareHouse.findById(req.params.id)
      .select('name email phone location description'); // Select specific fields
    
    if (!softwarehouse) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      _id: softwarehouse._id,
      name: softwarehouse.name,
      email: softwarehouse.email,
      phone: softwarehouse.phone,
      location: softwarehouse.location,
      description: softwarehouse.description
      // Add other fields you need
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};




module.exports = {
  getSofthouse,
  getSofthouseStatus,
  getProfile,
  addSofthouse,
  updateSofthouse,
  updateStatus,
  deleteSofthouse,
  getSoftwarehouse
};
