const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // Link to Student account (optional — public bookings won't have this)
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },

    // Personal details filled in the booking form
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    permanentAddress: String,
    temporaryAddress: String,
    dob: Date,
    educationStatus: String,

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    actionedBy: {
      type: String,
      enum: ["Owner", "Warden"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
