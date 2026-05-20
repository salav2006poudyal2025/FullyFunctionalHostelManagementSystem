const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    tokenPayment: {
      transactionId: String,
      method: String,
      amount: Number,
      status: {
        type: String,
        enum: ["Pending", "Verified"],
        default: "Pending",
      },
      createdAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
