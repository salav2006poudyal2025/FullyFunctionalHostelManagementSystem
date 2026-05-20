const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    seaterType: { type: Number, enum: [2, 3, 4], required: true },
    totalSeats: { type: Number, required: true },
    occupiedSeats: { type: Number, default: 0 },
    monthlyFee: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Available", "Full"],
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
