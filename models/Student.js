const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

  fullName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  phone: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  educationStatus: {
    type: String,
    default: ""
  },

  permanentAddress: {
    type: String,
    default: ""
  },

  temporaryAddress: {
    type: String,
    default: ""
  },

  bookingStatus: {
    type: String,
    default: "Pending"
  },

  approvedBy: {
    type: String,
    default: ""
  },

  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  "Student",
  studentSchema
);