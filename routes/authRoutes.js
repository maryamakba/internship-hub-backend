const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Softhouse = require('../models/softwarehouseModel');

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret_key';

router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  
  const userExist = await User.findOne({ email });
  const isUnique = userExist ? false: true;
  res.json({ isUnique });
});

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const userExist = await User.findOne({ email });
  if (userExist) return res.status(400).json({ message: 'This email already registered.' });
  let user = new User({ name, email, password: hashedPassword, role });
  if(role == 'student'){
    let status=1;
    user = new User({ name, email, password: hashedPassword, role, status });
  }
  await user.save();

  res.status(201).json({ message: 'User registered successfully' });
});

router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email, role});
  if (!user) return res.status(400).json({ message: 'Invalid email or password' });

  console.log("user record in login", user);
  if (user && user.status !=1) return res.status(400).json({ message: 'You account is not active' });

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) return res.status(400).json({ message: 'Invalid password' });

  const softhouse = await Softhouse.findOne({email: user.email});
  const companyId = softhouse ? softhouse._id: '';

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token: token, user: user, companyId });
});

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
