const Student = require("../models/Student");
const Room = require("../models/Room");

// ADD STUDENT (with duplicate check)
exports.addStudent = async (req, res) => {
  try {
    const { email } = req.body;

    const existing = await Student.findOne({
      email,
      bookingStatus: { $in: ["Pending", "Approved"] }
    });

    if (existing) {
      return res.json({
        message: "A booking request from this email already exists"
      });
    }

    const student = new Student(req.body);
    await student.save();

    res.json(student);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// APPROVE STUDENT
exports.approveStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    const room = await Room.findById(student.room);

    if (room.occupiedSeats >= room.totalSeats) {
      return res.json({ message: "Room full" });
    }

    student.bookingStatus = "Approved";
    await student.save();

    room.occupiedSeats += 1;
    room.seatsLeft = room.totalSeats - room.occupiedSeats;

    room.status = room.seatsLeft === 0 ? "Full" : "Available";

    await room.save();

    res.json({ message: "Approved" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};