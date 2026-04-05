const Student = require("../models/Student");
const Room = require("../models/Room");

// ================= VIEW =================
exports.getStudents = async (req, res) => {
  const students = await Student.find().populate("room");
  res.json(students);
};

// ================= ADD =================
exports.addStudent = async (req, res) => {
  try {
    const { email } = req.body;

    // 🔍 Check existing student with same email
    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      // ❌ Block if Pending or Approved
      if (
        existingStudent.bookingStatus === "Pending" ||
        existingStudent.bookingStatus === "Approved"
      ) {
        return res.status(400).json({
          message: "A booking request from this email address already exists."
        });
      }

      // ✅ Allow if Rejected (we will delete old record or reuse)
    }

    // ✅ Create new student
    const student = new Student(req.body);

    student.bookingStatus = "Pending";
    student.approvedBy = null;

    await student.save();

    res.json(student);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= EDIT =================
exports.updateStudent = async (req, res) => {
  const updated = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

// ================= DELETE =================
exports.deleteStudent = async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
};

// ================= VIEW ALL BOOKINGS (OWNER) =================
exports.getAllBookings = async (req, res) => {
  const students = await Student.find().populate("room");
  res.json(students);
};

// ================= APPROVE BOOKING =================
exports.approveStudent = async (req, res) => {
  try {
    const { role } = req.body; // "owner" or "warden"

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ❌ already actioned
    if (student.bookingStatus !== "Pending") {
      return res.json({
        message: `Already actioned by ${student.approvedBy}`
      });
    }

    const room = await Room.findById(student.room);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // ❌ prevent overbooking
    if (room.occupiedSeats >= room.totalSeats) {
      return res.json({ message: "Room is already full" });
    }

    // ✅ approve student
    student.bookingStatus = "Approved";
    student.approvedBy = role;

    await student.save();

    // ✅ update room
    room.occupiedSeats += 1;

    // 🔥 MAIN LOGIC
    room.seatsLeft = room.totalSeats - room.occupiedSeats;

    room.status = room.seatsLeft === 0 ? "Full" : "Available";

    await room.save();

    res.json({
      message: `Student approved by ${role}`,
      room
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= REJECT BOOKING =================
exports.rejectStudent = async (req, res) => {
  try {
    const { role } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ❌ already actioned
    if (student.bookingStatus !== "Pending") {
      return res.json({
        message: `Already actioned by ${student.approvedBy}`
      });
    }

    // ✅ reject
    student.bookingStatus = "Rejected";
    student.approvedBy = role;

    await student.save();

    res.json({
      message: `Student rejected by ${role}`
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};