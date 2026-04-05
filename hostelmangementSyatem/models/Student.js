const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  fullName: String,
  phone: Number,
  email: String,
  permanentAddress: String,
  temporaryAddress: String,
  dateOfBirth: Date,
  educationStatus: String,
  roomNumber: Number,
  moveInStatus: {
    type: String,
    default: "pending"
  },
  bookingStatus: {
    type: String,
    default: "Pending"
  },
  approvedBy: {
    type: String, // "warden" or "owner"
    default: null
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },
  bookingStatus: {
    type: String,
    default: "Pending"
  }
  
});

module.exports = mongoose.model("Student", studentSchema);