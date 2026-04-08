const mongoose = require("mongoose");

const wardenSchema = new mongoose.Schema({
  fullName: String,

  email: {
    type: String,
    required: true,
    unique: true
  },

  phone: String,

  password: String,

  status: {
    type: String,
    default: "Active"
  }
});

module.exports = mongoose.model("Warden", wardenSchema);