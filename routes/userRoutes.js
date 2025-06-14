const express = require("express");
const {
  getUsers,
  getActiveUsers,
  addUser,
  updateUser,
  updateStatus,
  deleteUser,
  forgetPassword,
  resetPassword,
  getstudentbyid
} = require("../controllers/userController");
const Student = require("../models/userModel");
const SoftwareHouse = require("../models/softwarehouseModel");
const router = express.Router();

router.get("/:role", getUsers);
router.get("/active", getActiveUsers);
router.post("/", addUser);
router.put("/:id", updateUser);
router.patch("/:id", updateUser);
router.put("/status/:id", updateStatus);
router.delete("/:id", deleteUser);
router.post("/forgetpassword", forgetPassword);
router.post("/resetpassword/:token", resetPassword);


router.get("/all", async (req, res) => {
  try {
    const students = await Student.find().select("_id name");
    const softwareHouses = await SoftwareHouse.find().select("_id name");

    const formattedUsers = [
      ...students.map((s) => ({ _id: s._id, name: s.name, role: "Student" })),
      ...softwareHouses.map((s) => ({
        _id: s._id,
        name: s.name,
        role: "Software House",
      })),
    ];

    res.json(formattedUsers);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

module.exports = router;
