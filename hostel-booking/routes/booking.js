// routes/booking.js
const express = require("express");
const path = require("path");
const { rooms, bookings } = require("../data/rooms");
const { validateBookingForm } = require("./validation");

const router = express.Router();

function getOccupancyData() {
  return rooms.map((room) => {
    const approvedStudents = bookings.filter(
      (b) => b.roomNumber === room.roomNumber && b.status === "Approved"
    );
    const occupiedSeats = approvedStudents.length;
    const seatsLeft = Math.max(room.totalSeats - occupiedSeats, 0);
    const status = seatsLeft > 0 ? "Available" : "Full";

    return {
      roomNumber: room.roomNumber,
      seaterType: room.seaterType,
      totalSeats: room.totalSeats,
      occupiedSeats,
      seatsLeft,
      status,
      students: approvedStudents,
    };
  });
}

// Serve booking form
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Warden dashboard
router.get("/warden", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "warden-dashboard.html"));
});

// API: long polling for occupancy summary
router.get("/api/rooms", (req, res) => {
  res.json({ success: true, data: getOccupancyData() });
});

// API: list students for a room
router.get("/api/rooms/:roomNumber/students", (req, res) => {
  const roomNumber = req.params.roomNumber;
  const room = rooms.find((r) => r.roomNumber === roomNumber);

  if (!room) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }

  const approved = bookings.filter(
    (b) => b.roomNumber === roomNumber && b.status === "Approved"
  );

  res.json({ success: true, data: approved });
});

// API: submit booking request
router.post("/api/bookings", (req, res) => {
  const data = req.body;
  const errors = validateBookingForm(data);

  if (Object.keys(errors).length) {
    return res.status(400).json({ success: false, errors });
  }

  const room = rooms.find((r) => r.roomNumber === data.roomNumber);
  if (!room) {
    return res.status(400).json({ success: false, message: "Selected room does not exist" });
  }

  const nextId = bookings.length ? bookings[bookings.length - 1].id + 1 : 1;

  const booking = {
    id: nextId,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    roomNumber: data.roomNumber,
    checkIn: data.checkIn,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);

  res.status(201).json({ success: true, data: booking });
});

// API: approve a booking
router.post("/api/bookings/:id/approve", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  const room = rooms.find((r) => r.roomNumber === booking.roomNumber);
  if (!room) {
    return res.status(400).json({ success: false, message: "Room does not exist" });
  }

  const occupancy = bookings.filter(
    (b) => b.roomNumber === room.roomNumber && b.status === "Approved"
  ).length;

  if (occupancy >= room.totalSeats) {
    return res.status(400).json({ success: false, message: "Room is full" });
  }

  booking.status = "Approved";
  res.json({ success: true, data: booking });
});

// API: edit student record (booking)
router.put("/api/bookings/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  const data = req.body;
  const errors = validateBookingForm(data);

  if (Object.keys(errors).length) {
    return res.status(400).json({ success: false, errors });
  }

  booking.fullName = data.fullName;
  booking.email = data.email;
  booking.phone = data.phone;
  booking.roomNumber = data.roomNumber;
  booking.checkIn = data.checkIn;

  res.json({ success: true, data: booking });
});

// API: delete student record
router.delete("/api/bookings/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = bookings.findIndex((b) => b.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  const deleted = bookings.splice(index, 1)[0];
  res.json({ success: true, data: deleted });
});

module.exports = router;
