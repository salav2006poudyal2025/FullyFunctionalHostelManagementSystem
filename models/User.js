const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["Owner", "Warden"],
    default: "Owner"
  }
});

module.exports = mongoose.model("User", userSchema);