const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: String,

  totalSeats: {
    type: Number,
    required: true
  },

  occupiedSeats: {
    type: Number,
    default: 0
  },

  seatsLeft: {
    type: Number,
    default: function () {
      return this.totalSeats;
    }
  },

  status: {
    type: String,
    default: "Available"
  }
});

module.exports = mongoose.model("Room", roomSchema);