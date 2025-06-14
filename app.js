
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const profileRoutes = require("./routes/profileRoutes");
const remarkRoutes = require('./routes/remarkRoutes'); // Import the remark routes
// app.js or server.js
 


dotenv.config();
connectDB(); // Connect MongoDB

const app = express();
const server = http.createServer(app);

// Set up Socket.io with CORS support
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your frontend
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

// Middleware
app.use(cors());

app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve image uploads

// Main App Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", userRoutes); // User routes
app.use("/api/chat", chatRoutes); // Chat routes
app.use("/api/softwarehouses", require("./routes/softwarehouseRoutes")); // Software House routes
app.use("/api/internships", require("./routes/internshipRoutes")); // Internships routes
app.use("/api/applications", applicationRoutes); // Application routes
app.use("/api/tasks", require("./routes/taskRoutes")); // Task routes
app.use("/api/profiles", profileRoutes); // Profile routes
app.use('/api/remarks',require('./routes/remarkRoutes') );


// Serve the chatbot logic
require("./chatbot"); // Import the chatbot logic

const port=process.env.PORT || 5000;
// Start the server
server.listen(port, () => {
  console.log("Server running on port 5000");
  
});