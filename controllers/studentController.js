const Student = require("../models/Student");
const Room = require("../models/Room");


// ======================================================
// VIEW ALL STUDENTS
// ======================================================

exports.getStudents = async (req, res) => {

  try {

    const students = await Student.find()
      .populate("room");

    res.status(200).json(students);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};


// ======================================================
// ADD STUDENT / BOOK ROOM
// ======================================================

exports.addStudent = async (req, res) => {

  try {

    const {
      fullName,
      email,
      phone,
      room
    } = req.body;

    // REQUIRED FIELD VALIDATION
    if (
      !fullName ||
      !email ||
      !phone ||
      !room
    ) {

      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // CHECK DUPLICATE BOOKING
    const existing = await Student.findOne({

      email,

      bookingStatus: {
        $in: ["Pending", "Approved"]
      }
    });

    // BLOCK DUPLICATE REQUEST
    if (existing) {

      return res.status(409).json({

        message:
          "A booking request from this email address already exists."
      });
    }

    // CREATE NEW STUDENT
    const student = new Student({

      ...req.body,

      bookingStatus: "Pending"
    });

    await student.save();

    // SUCCESS RESPONSE
    res.status(201).json({

      message:
        "Booking request submitted successfully",

      student
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};


// ======================================================
// UPDATE STUDENT
// ======================================================

exports.updateStudent = async (req, res) => {

  try {

    const updatedStudent =
      await Student.findByIdAndUpdate(

        req.params.id,

        req.body,

        {
          new: true
        }
      );

    if (!updatedStudent) {

      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json(updatedStudent);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};


// ======================================================
// DELETE STUDENT
// ======================================================

exports.deleteStudent = async (req, res) => {

  try {

    const deletedStudent =
      await Student.findByIdAndDelete(
        req.params.id
      );

    if (!deletedStudent) {

      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json({
      message: "Deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};


// ======================================================
// GET ALL BOOKINGS
// OWNER + WARDEN DASHBOARD
// ======================================================

exports.getAllBookings = async (req, res) => {

  try {

    const students = await Student.find()
      .populate("room");

    res.status(200).json(students);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};


// ======================================================
// APPROVE STUDENT BOOKING
// ======================================================

exports.approveStudent = async (req, res) => {

  try {

    const { role } = req.body;

    // FIND STUDENT
    const student = await Student.findById(
      req.params.id
    );

    if (!student) {

      return res.status(404).json({
        message: "Student not found"
      });
    }

    // ALREADY ACTIONED
    if (student.bookingStatus !== "Pending") {

      return res.status(200).json({

        message:
          `Already actioned by ${student.approvedBy}`
      });
    }

    // FIND ROOM
    const room = await Room.findById(
      student.room
    );

    if (!room) {

      return res.status(404).json({
        message: "Room not found"
      });
    }

    // PREVENT OVERBOOKING
    if (room.occupiedSeats >= room.totalSeats) {

      return res.status(400).json({
        message: "Room is Full"
      });
    }

    // APPROVE BOOKING
    student.bookingStatus = "Approved";

    student.approvedBy = role;

    await student.save();

    // UPDATE ROOM DATA
    room.occupiedSeats += 1;

    room.seatsLeft =
      room.totalSeats - room.occupiedSeats;

    // AUTO UPDATE ROOM STATUS
    room.status =
      room.occupiedSeats === room.totalSeats
        ? "Full"
        : "Available";

    await room.save();

    // SUCCESS RESPONSE
    res.status(200).json({

      message: `Approved by ${role}`,

      student,

      room
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};


// ======================================================
// REJECT STUDENT BOOKING
// ======================================================

exports.rejectStudent = async (req, res) => {

  try {

    const { role } = req.body;

    // FIND STUDENT
    const student = await Student.findById(
      req.params.id
    );

    if (!student) {

      return res.status(404).json({
        message: "Student not found"
      });
    }

    // ALREADY ACTIONED
    if (student.bookingStatus !== "Pending") {

      return res.status(200).json({

        message:
          `Already actioned by ${student.approvedBy}`
      });
    }

    // REJECT STUDENT
    student.bookingStatus = "Rejected";

    student.approvedBy = role;

    await student.save();

    // SUCCESS RESPONSE
    res.status(200).json({

      message: `Rejected by ${role}`,

      student
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};


// ======================================================
// UPDATE STUDENT PROFILE
// ======================================================

exports.updateProfile = async (req, res) => {

  try {

    const {
      fullName,
      phone,
      educationStatus,
      permanentAddress,
      temporaryAddress
    } = req.body;

    // REQUIRED FIELD VALIDATION
    if (
      !fullName ||
      !phone ||
      !educationStatus ||
      !permanentAddress ||
      !temporaryAddress
    ) {

      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // FIND STUDENT USING JWT TOKEN
    const student = await Student.findById(
      req.student.id
    );

    if (!student) {

      return res.status(404).json({
        message: "Student not found"
      });
    }

    // UPDATE ALLOWED FIELDS
    student.fullName = fullName;

    student.phone = phone;

    student.educationStatus =
      educationStatus;

    student.permanentAddress =
      permanentAddress;

    student.temporaryAddress =
      temporaryAddress;

    // EMAIL WILL NOT CHANGE
    // SECURITY REQUIREMENT

    await student.save();

    // SUCCESS RESPONSE
    res.status(200).json(student);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};


// ======================================================
// GET CURRENT STUDENT PROFILE
// ======================================================

exports.getProfile = async (req, res) => {

  try {

    const student = await Student.findById(
      req.student.id
    )
      .select("-password")
      .populate("room");

    if (!student) {

      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json(student);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};


// ======================================================
// GET CURRENT BOOKING STATUS
// ======================================================

exports.getBookingStatus = async (
  req,
  res
) => {

  try {

    // ==========================================
    // GET STUDENT ID FROM JWT
    // ==========================================

    const studentId = req.student.id;

    // ==========================================
    // FIND MOST RECENT BOOKING
    // ==========================================

    const booking = await Student.findById(
      studentId
    )

    .populate({

      path: "room",

      select:
        "roomNumber seaterType monthlyFee"
    });

    // ==========================================
    // NO BOOKING FOUND
    // ==========================================

    if (!booking) {

      return res.status(200).json({

        booking: null
      });
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({

      booking: {

        bookingId: booking._id,

        room: booking.room
          ? {

              number:
                booking.room.roomNumber,

              seaterType:
                booking.room.seaterType,

              fee:
                booking.room.monthlyFee
            }

          : null,

        status:
          booking.bookingStatus,

        createdAt:
          booking.createdAt
      }
    });

  } catch (error) {

    res.status(500).json({

      error: error.message
    });
  }
};