const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  paymentId: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  month: {
    type: String,
    required: true
  },

  recordedAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  "Payment",
  paymentSchema
);