const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: Number, required: true, unique: true, min: 1 },
    seaterType: { type: Number, enum: [2, 3, 4], required: true },
    totalSeats: { type: Number, required: true },
    occupiedSeats: { type: Number, default: 0 },
    monthlyFee: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Available", "Full"],
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
