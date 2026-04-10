// routes/booking.js
const express = require("express");
const path = require("path");
const { Room, Booking } = require("../data/rooms");
const { validateBookingForm } = require("./validation");

const router = express.Router();

// Auth helpers
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

function requireWardenOrOwner(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  if (req.session.user.role !== "warden" && req.session.user.role !== "owner") {
    return res.redirect("/" + req.session.user.role + "-dashboard");
  }
  next();
}

function requireOwner(req, res, next) {
  if (!req.session.user || req.session.user.role !== "owner") {
    return res.redirect("/login");
  }
  next();
}

async function getOccupancyData() {
  try {
    const rooms = await Room.find({});
    const occupancyData = await Promise.all(
      rooms.map(async (room) => {
        const approvedStudents = await Booking.find({
          roomNumber: room.roomNumber,
          status: "Approved"
        });
        const occupiedSeats = approvedStudents.length;
        const seatsLeft = Math.max(room.totalSeats - occupiedSeats, 0);
        const status = seatsLeft > 0 ? "Available" : "Full";

        return {
          roomNumber: room.roomNumber,
          seaterType: room.seaterType,
          totalSeats: room.totalSeats,
          monthlyFee: room.price,
          occupiedSeats,
          seatsLeft,
          status,
          students: approvedStudents,
        };
      })
    );
    return occupancyData;
  } catch (error) {
    console.error('Error fetching occupancy data:', error);
    throw error;
  }
}

// Serve booking form
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Warden dashboard
router.get("/warden", requireWardenOrOwner, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "warden-dashboard.html"));
});

// Admin dashboard
router.get("/admin", requireOwner, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "admin-dashboard.html"));
});

// Owner payments page
router.get("/payments", requireOwner, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "payments.html"));
});

// Owner room management pages
router.get("/rooms", requireOwner, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "rooms.html"));
});

// API: create new room
router.post("/api/rooms", requireOwner, async (req, res) => {
  try {
    const { roomNumber, seaterType, monthlyFee } = req.body;

    // Validation
    if (!roomNumber || typeof roomNumber !== "string" || !roomNumber.trim()) {
      return res.status(400).json({ success: false, message: "roomNumber is required and must be a non-empty string." });
    }
    if (![2, 3, 4].includes(seaterType)) {
      return res.status(400).json({ success: false, message: "seaterType must be 2, 3, or 4." });
    }
    if (typeof monthlyFee !== "number" || monthlyFee <= 0) {
      return res.status(400).json({ success: false, message: "monthlyFee must be a positive number." });
    }

    // Trim and validate room number format
    const trimmedRoomNumber = roomNumber.trim();
    if (trimmedRoomNumber.length > 10) {
      return res.status(400).json({ success: false, message: "Room number must be 10 characters or less." });
    }

    // Check if room already exists
    const existingRoom = await Room.findOne({ roomNumber: trimmedRoomNumber });
    if (existingRoom) {
      return res.status(409).json({ success: false, message: "A room with this number already exists." });
    }

    // Create new room
    const newRoom = new Room({
      roomNumber: trimmedRoomNumber,
      seaterType,
      totalSeats: seaterType,
      price: monthlyFee,
      occupiedSeats: 0,
      seatsLeft: seaterType,
      status: "Available",
    });

    const savedRoom = await newRoom.save();

    console.log(`Room created: ${savedRoom.roomNumber} (${savedRoom.seaterType} seater, ₹${savedRoom.price}) by owner`);

    res.status(201).json({ success: true, data: savedRoom });
  } catch (error) {
    console.error('Error creating room:', error);
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(409).json({ success: false, message: "A room with this number already exists." });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API: get single room details
router.get("/api/rooms/:id", requireOwner, async (req, res) => {
  try {
    const id = req.params.id;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid room ID format" });
    }

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    console.log(`Room details requested: ${room.roomNumber} by owner`);
    res.json({ success: true, data: room });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API: update room details
router.put("/api/rooms/:id", requireOwner, async (req, res) => {
  try {
    const id = req.params.id;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid room ID format" });
    }

    const { seaterType, monthlyFee } = req.body;

    // Validation
    if (seaterType !== undefined && ![2, 3, 4].includes(seaterType)) {
      return res.status(400).json({ success: false, message: "seaterType must be 2, 3, or 4." });
    }
    if (monthlyFee !== undefined && (typeof monthlyFee !== "number" || monthlyFee <= 0)) {
      return res.status(400).json({ success: false, message: "monthlyFee must be a positive number." });
    }
    if (monthlyFee !== undefined && monthlyFee > 50000) {
      return res.status(400).json({ success: false, message: "monthlyFee cannot exceed ₹50,000." });
    }

    // Check if at least one field is provided
    if (seaterType === undefined && monthlyFee === undefined) {
      return res.status(400).json({ success: false, message: "At least one field (seaterType or monthlyFee) must be provided for update." });
    }

    // Find the room
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Check capacity reduction constraint
    if (seaterType !== undefined && seaterType < room.seaterType) {
      // Count current approved bookings for this room
      const approvedBookings = await Booking.countDocuments({
        roomNumber: room.roomNumber,
        status: "Approved"
      });

      if (approvedBookings > seaterType) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce capacity to ${seaterType} seater. Room currently has ${approvedBookings} approved students.`
        });
      }
    }

    // Track changes for logging
    const changes = [];
    if (seaterType !== undefined && seaterType !== room.seaterType) {
      changes.push(`seaterType: ${room.seaterType} → ${seaterType}`);
    }
    if (monthlyFee !== undefined && monthlyFee !== room.price) {
      changes.push(`monthlyFee: ₹${room.price} → ₹${monthlyFee}`);
    }

    // Update room fields
    if (seaterType !== undefined) {
      room.seaterType = seaterType;
      room.totalSeats = seaterType;
      room.seatsLeft = seaterType - room.occupiedSeats;
      room.status = room.seatsLeft > 0 ? "Available" : "Full";
    }

    if (monthlyFee !== undefined) {
      room.price = monthlyFee;
    }

    const updatedRoom = await room.save();

    console.log(`Room updated: ${updatedRoom.roomNumber} (${changes.join(', ')}) by owner`);

    res.json({ success: true, data: updatedRoom });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API: long polling for occupancy summary
router.get("/api/rooms", requireWardenOrOwner, async (req, res) => {
  try {
    const occupancyData = await getOccupancyData();
    res.json({ success: true, data: occupancyData });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API: get pending bookings
router.get("/api/bookings/pending", requireWardenOrOwner, async (req, res) => {
  try {
    const pending = await Booking.find({ status: "Pending" });
    res.json({ success: true, data: pending });
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API: get all bookings
router.get("/api/bookings", requireOwner, async (req, res) => {
  try {
    const bookings = await Booking.find({});
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API: get payments list for approved students
router.get("/api/payments", requireOwner, async (req, res) => {
  try {
    const approvedBookings = await Booking.find({ status: "Approved" });

    const paymentsData = await Promise.all(
      approvedBookings.map(async (booking) => {
        const room = await Room.findOne({ roomNumber: booking.roomNumber });
        return {
          id: booking._id,
          fullName: booking.fullName,
          roomNumber: booking.roomNumber,
          monthlyFee: room ? room.price : 0,
          paymentStatus: booking.paymentStatus || "Pending",
        };
      })
    );

    res.json({ success: true, data: paymentsData });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API: update payment status
router.put("/api/payments/:id", requireOwner, async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.findOne({ _id: id, status: "Approved" });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found or not approved" });
    }

    const { paymentStatus } = req.body;
    if (!["Pending", "Complete"].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: "Invalid payment status" });
    }

    const oldStatus = booking.paymentStatus;
    booking.paymentStatus = paymentStatus;
    await booking.save();

    // Log payment status change for audit
    console.log(`Payment status updated: Student ${booking.fullName} (${booking._id}) - ${oldStatus} -> ${paymentStatus} by owner`);

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API: reset all payments to Pending
router.post("/api/payments/reset", requireOwner, async (req, res) => {
  try {
    const result = await Booking.updateMany(
      { status: "Approved" },
      { paymentStatus: "Pending" }
    );

    // Log bulk reset for audit
    console.log(`Payment reset performed by owner: ${result.modifiedCount} students reset to Pending`);

    res.json({ success: true, message: "All payment statuses reset" });
  } catch (error) {
    console.error('Error resetting payments:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API: list students for a room
router.get("/api/rooms/:roomNumber/students", requireWardenOrOwner, async (req, res) => {
  try {
    const roomNumber = req.params.roomNumber;
    const room = await Room.findOne({ roomNumber });

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const approved = await Booking.find({
      roomNumber,
      status: "Approved"
    });

    res.json({ success: true, data: approved });
  } catch (error) {
    console.error('Error fetching room students:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API: submit booking request
router.post("/api/bookings", async (req, res) => {
  try {
    const data = req.body;
    const errors = validateBookingForm(data);

    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, errors });
    }

    const room = await Room.findOne({ roomNumber: data.roomNumber });
    if (!room) {
      return res.status(400).json({ success: false, message: "Selected room does not exist" });
    }

    const booking = new Booking({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      roomNumber: data.roomNumber,
      checkIn: data.checkIn,
      status: "Pending",
    });

    const savedBooking = await booking.save();

    res.status(201).json({ success: true, data: savedBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API: approve a booking
router.post("/api/bookings/:id/approve", requireWardenOrOwner, async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Booking already actioned" });
    }

    const room = await Room.findOne({ roomNumber: booking.roomNumber });
    if (!room) {
      return res.status(400).json({ success: false, message: "Room does not exist" });
    }

    const occupancy = await Booking.countDocuments({
      roomNumber: room.roomNumber,
      status: "Approved"
    });

    if (occupancy >= room.totalSeats) {
      return res.status(400).json({ success: false, message: "This room is currently full. Approval blocked." });
    }

    booking.status = "Approved";
    booking.paymentStatus = booking.paymentStatus || "Pending";
    booking.actionedBy = req.body.actionedBy || "warden";
    booking.actionedAt = new Date();
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error approving booking:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API: reject a booking
router.post("/api/bookings/:id/reject", requireWardenOrOwner, async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Booking already actioned" });
    }

    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: "Rejection reason is required" });
    }

    booking.status = "Rejected";
    booking.rejectionReason = reason.trim();
    booking.actionedBy = req.body.actionedBy || "warden";
    booking.actionedAt = new Date();
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API: edit student record (booking)
router.put("/api/bookings/:id", requireOwner, async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.findById(id);

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

    await booking.save();

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// API: delete student record
router.delete("/api/bookings/:id", requireOwner, (req, res) => {
  try {
    const id = req.params.id;
    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, data: deletedBooking });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
