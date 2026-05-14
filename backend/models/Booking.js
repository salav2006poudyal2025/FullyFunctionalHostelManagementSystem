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
    phone: { 
      type: String, 
      required: true, 
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v);
        },
        message: 'Phone number must be exactly 10 digits'
      }
    },
    email: { 
      type: String, 
      required: true, 
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    permanentAddress: String,
    temporaryAddress: String,
    dob: {
      type: Date,
      required: true,
      validate: {
        validator: function(v) {
          const age = new Date().getFullYear() - new Date(v).getFullYear();
          return age >= 16;
        },
        message: 'Age must be 16 or above'
      }
    },
    educationStatus: String,

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    tokenPayment: {
      amount: { type: Number, default: 500, min: 0 },
      status: {
        type: String,
        enum: ["Pending", "Confirmed", "Expired"],
        default: "Pending",
      },
      transactionId: String,
      pidx: String,
      paymentUrl: String,
      method: { type: String, default: "Khalti" },
      reference: String,
      expiresAt: Date,
      paidAt: Date,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    actionedBy: {
      type: String,
      enum: ["Owner", "Warden", "Student"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
