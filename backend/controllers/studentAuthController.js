const Student = require("../models/Student");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /api/student/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const exists = await Student.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const student = await Student.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
    });

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      student: { id: student._id, name: student.name, email: student.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/student/login  — accepts { name, password }
exports.login = async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: "Name and password are required" });
    }

    // Find student by name (case-insensitive)
    const student = await Student.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (!student) {
      return res.status(400).json({ message: "Invalid name or password" });
    }

    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid name or password" });
    }

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      student: { id: student._id, name: student.name, email: student.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/student/me  — returns full student profile + booking + payments
exports.getMe = async (req, res) => {
  try {
    const student = req.student;

    // Find the most recent booking for this student (by student ref or email match)
    const booking = await Booking.findOne({
      $or: [
        { student: student._id },
        { email: student.email },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("room");

    // Monthly payments linked to this booking
    let payments = [];
    if (booking) {
      payments = await Payment.find({ booking: booking._id }).sort({ createdAt: -1 });
    }

    res.json({
      student: {
        name: student.name,
        email: student.email,
      },
      booking: booking
        ? {
            _id: booking._id,
            status: booking.status,
            createdAt: booking.createdAt,
            fullName: booking.fullName,
            phone: booking.phone,
            email: booking.email,
            permanentAddress: booking.permanentAddress,
            temporaryAddress: booking.temporaryAddress,
            dob: booking.dob,
            educationStatus: booking.educationStatus,
            room: booking.room
              ? {
                  roomNumber: booking.room.roomNumber,
                  seaterType: booking.room.seaterType,
                  monthlyFee: booking.room.monthlyFee,
                  totalSeats: booking.room.totalSeats,
                  occupiedSeats: booking.room.occupiedSeats,
                }
              : null,
          }
        : null,
      payments: payments.map((p) => ({
        _id: p._id,
        month: p.month,
        amount: p.amount,
        status: p.status,
        createdAt: p.createdAt,
      })),
      tokenPayment: student.tokenPayment
        ? {
            transactionId: student.tokenPayment.transactionId,
            method: student.tokenPayment.method,
            amount: student.tokenPayment.amount,
            status: student.tokenPayment.status,
            createdAt: student.tokenPayment.createdAt,
          }
        : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/student/me  — update student profile and booking details
exports.updateMe = async (req, res) => {
  try {
    const student = req.student;
    const {
      name,
      email,
      fullName,
      phone,
      permanentAddress,
      temporaryAddress,
      dob,
      educationStatus,
    } = req.body;

    if (name) student.name = name;
    if (email) student.email = email.toLowerCase();
    await student.save();

    const booking = await Booking.findOne({
      $or: [{ student: student._id }, { email: student.email }],
    })
      .sort({ createdAt: -1 })
      .populate("room");

    if (booking) {
      const allowed = [
        "fullName",
        "phone",
        "email",
        "permanentAddress",
        "temporaryAddress",
        "dob",
        "educationStatus",
      ];

      allowed.forEach((field) => {
        if (req.body[field] !== undefined) {
          booking[field] = field === "email" ? req.body[field].toLowerCase() : req.body[field];
        }
      });

      await booking.save();
    }

    const payments = booking
      ? await Payment.find({ booking: booking._id }).sort({ createdAt: -1 })
      : [];

    res.json({
      student: {
        name: student.name,
        email: student.email,
      },
      booking: booking
        ? {
            _id: booking._id,
            status: booking.status,
            createdAt: booking.createdAt,
            fullName: booking.fullName,
            phone: booking.phone,
            email: booking.email,
            permanentAddress: booking.permanentAddress,
            temporaryAddress: booking.temporaryAddress,
            dob: booking.dob,
            educationStatus: booking.educationStatus,
            room: booking.room
              ? {
                  roomNumber: booking.room.roomNumber,
                  seaterType: booking.room.seaterType,
                  monthlyFee: booking.room.monthlyFee,
                  totalSeats: booking.room.totalSeats,
                  occupiedSeats: booking.room.occupiedSeats,
                }
              : null,
          }
        : null,
      payments: payments.map((p) => ({
        _id: p._id,
        month: p.month,
        amount: p.amount,
        status: p.status,
        createdAt: p.createdAt,
      })),
      tokenPayment: student.tokenPayment
        ? {
            transactionId: student.tokenPayment.transactionId,
            method: student.tokenPayment.method,
            amount: student.tokenPayment.amount,
            status: student.tokenPayment.status,
            createdAt: student.tokenPayment.createdAt,
          }
        : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/student/token-payment  — store Khalti payment info for student
exports.tokenPayment = async (req, res) => {
  try {
    const student = req.student;
    const { transactionId, method, amount } = req.body;

    if (!transactionId || !method || !amount) {
      return res.status(400).json({ message: "transactionId, method and amount are required" });
    }

    student.tokenPayment = {
      transactionId,
      method,
      amount,
      status: "Pending",
      createdAt: new Date(),
    };

    await student.save();

    res.json({
      success: true,
      message: "Token payment received and pending verification",
      tokenPayment: student.tokenPayment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
