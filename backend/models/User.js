const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: String,
    password: { type: String, required: true },
    role: { type: String, enum: ["Owner", "Warden"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
