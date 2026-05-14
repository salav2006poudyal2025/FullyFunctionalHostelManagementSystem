const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Payment = require("../models/Payment");

// POST /api/bookings  (public — student submits booking)
exports.createBooking = async (req, res) => {
  try {
    const { room: roomId, fullName, phone, email, permanentAddress, temporaryAddress, dob, educationStatus, student } = req.body;

    if (!fullName || !phone || !email || !dob) {
      return res.status(400).json({ message: "Full name, phone, email, and date of birth are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    if (age < 16) {
      return res.status(400).json({ message: "Age must be 16 or above" });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.status === "Full") return res.status(400).json({ message: "Room is full" });

    // Prevent duplicate pending booking for same email
    const existing = await Booking.findOne({ email: email.toLowerCase(), status: "Pending" });
    if (existing) {
      return res.status(400).json({ message: "You already have a pending booking request" });
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const reference = `${email.toLowerCase()}-${Date.now()}`;

    const booking = await Booking.create({
      student: student || undefined,
      fullName,
      phone,
      email: email.toLowerCase(),
      permanentAddress,
      temporaryAddress,
      dob,
      educationStatus,
      room: roomId,
      tokenPayment: {
        amount: 500,
        method: "Khalti",
        status: "Pending",
        expiresAt,
        reference,
      },
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/approve/:id
exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "Pending") return res.status(400).json({ message: "Booking already actioned" });
    if (booking.tokenPayment?.status !== "Confirmed") {
      return res.status(400).json({ message: "Rs.500 Khalti token payment must be confirmed before approval" });
    }

    const room = booking.room;
    if (room.occupiedSeats >= room.totalSeats) {
      return res.status(400).json({ message: "Room is full" });
    }

    booking.status = "Approved";
    booking.actionedBy = req.user.role;
    await booking.save();

    room.occupiedSeats += 1;
    room.status = room.occupiedSeats >= room.totalSeats ? "Full" : "Available";
    await room.save();

    // Create first month payment record
    const month = new Date().toISOString().slice(0, 7);
    await Payment.create({
      booking: booking._id,
      month,
      amount: room.monthlyFee,
    });

    res.json({ message: "Booking approved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/reject/:id
exports.rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "Pending") return res.status(400).json({ message: "Booking already actioned" });

    booking.status = "Rejected";
    booking.actionedBy = req.user.role;
    await booking.save();

    res.json({ message: "Booking rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/students
exports.getStudents = async (req, res) => {
  try {
    const students = await Booking.find()
      .populate("room")
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/students/:id
exports.updateStudent = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Student not found" });
    if (booking.status === "Approved") {
      return res.status(400).json({ message: "Cannot update an approved booking" });
    }

    const allowed = ["fullName", "phone", "email", "permanentAddress", "temporaryAddress", "dob", "educationStatus"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) booking[field] = req.body[field];
    });
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/bookings/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Student not found" });

    // If approved, free up the room seat
    if (booking.status === "Approved") {
      const room = await Room.findById(booking.room);
      if (room && room.occupiedSeats > 0) {
        room.occupiedSeats -= 1;
        room.status = "Available";
        await room.save();
      }
      // Remove related payments
      await Payment.deleteMany({ booking: booking._id });
    }

    await booking.deleteOne();
    res.json({ message: "Student record deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
