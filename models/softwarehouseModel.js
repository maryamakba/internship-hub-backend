const mongoose = require("mongoose");

const softwarehouseSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  description: String,
  status: { type: Number, default: 0 },
  dateCreated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("softwarehouses", softwarehouseSchema);
