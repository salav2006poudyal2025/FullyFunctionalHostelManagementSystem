const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,

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