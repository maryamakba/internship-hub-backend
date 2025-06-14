const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const Internship = require("../models/internshipModel");
const Application = require("../models/applicationModel");
// Get all users
const getUsers = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// // Hash the password before saving (for security)
//     bcrypt.hash('maryam@123', 10, (err, hashedPassword) => {
//       if (err) throw err;

//       // Create new admin user with hashed password
//       const newAdmin = new User({
//         name: 'Maryam Akbar',  // You can replace this with the user's name
//         email: 'maryamakbarcu@gmail.com',
//         password: hashedPassword,
//         role: 'admin',  // Set the role to 'admin'
//         status: 1,  // Assuming status 1 means active (you can adjust it based on your schema definition)
//       });

//       // Save the new user to the database
//       newAdmin.save()
//         .then(user => {
//           console.log('Admin user created:', user);
//         })
//         .catch(err => {
//           console.error('Error creating user:', err);
//         });
//     });




// Get Active users
const getActiveUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new user
const addUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist)
      return res
        .status(400)
        .json({ message: "This email already registered." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newRecord = new User({ name, email, password: hashedPassword, role });
    await newRecord.save();
    if (role === "softwarehouse") {
      const newSofth = new SoftwareHouse({ name, email });
      await newSofth.save();
    }

    res.status(201).json(newRecord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Upodate user
const updateUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, password: hashedPassword, role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

const updateStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found with that email" });

    const JWT_SECRET = "thisismysecetkey";
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    // Send email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "maryamakbarcui@gmail.com", // your email
        pass: "canm saij gnxn szko", // your password or app password
      },
    });

    const mailOptions = {
      from: "maryamakbarcui@gmail.com",
      to: email,
      subject: "Reset your password",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const JWT_SECRET = "thisismysecetkey";
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};




module.exports = {
  getUsers,
  getActiveUsers,
  addUser,
  updateUser,
  updateStatus,
  deleteUser,
  forgetPassword,
  resetPassword, 
};





