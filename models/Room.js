const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: String,
  totalSeats: Number,
  occupiedSeats: {
    type: Number,
    default: 0
  },
  seatsLeft: Number,
  status: {
    type: String,
    default: "Available"
  }
});

module.exports = mongoose.model("Room", roomSchema);