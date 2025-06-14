// Importing necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/design_collections', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Schema Definitions
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: { type: String, enum: ['student', 'software_house', 'admin'], required: true },
});

const internshipSchema = new mongoose.Schema({
    title: String,
    description: String,
    organization: String,
    duration: String,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const applicationSchema = new mongoose.Schema({
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
});

const certificateSchema = new mongoose.Schema({
    title: String,
    issuedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issuedBy: String,
    date: Date,
});

// Models
const User = mongoose.model('User', userSchema);
const Internship = mongoose.model('Internship', internshipSchema);
const Application = mongoose.model('Application', applicationSchema);
const Certificate = mongoose.model('Certificate', certificateSchema);

// Routes
// User routes
app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Internship routes
app.post('/internships', async (req, res) => {
    try {
        const internship = new Internship(req.body);
        await internship.save();
        res.status(201).json(internship);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/internships', async (req, res) => {
    try {
        const internships = await Internship.find().populate('postedBy');
        res.status(200).json(internships);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Application routes
app.post('/applications', async (req, res) => {
    try {
        const application = new Application(req.body);
        await application.save();
        res.status(201).json(application);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/applications', async (req, res) => {
    try {
        const applications = await Application.find().populate('applicant internship');
        res.status(200).json(applications);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Certificate routes
app.post('/certificates', async (req, res) => {
    try {
        const certificate = new Certificate(req.body);
        await certificate.save();
        res.status(201).json(certificate);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/certificates', async (req, res) => {
    try {
        const certificates = await Certificate.find().populate('issuedTo');
        res.status(200).json(certificates);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
