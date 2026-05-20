const express = require("express");

const router = express.Router();


// ======================================================
// IMPORT CONTROLLERS
// ======================================================

const {

  // STUDENT CRUD
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,

  // BOOKING MANAGEMENT
  getAllBookings,
  approveStudent,
  rejectStudent,

  // STUDENT PROFILE
  updateProfile,
  getProfile,

  getBookingStatus

} = require("../controllers/studentController");


// ======================================================
// IMPORT AUTH MIDDLEWARE
// ======================================================

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const protectedMiddleware = require(
  "../middleware/protectedMiddleware"
);


// ======================================================
// STUDENT CRUD ROUTES
// ======================================================

// VIEW ALL STUDENTS
router.get("/", getStudents);


// ADD STUDENT / BOOK ROOM
router.post("/", addStudent);


// UPDATE STUDENT
router.put("/:id", updateStudent);


// DELETE STUDENT
router.delete("/:id", deleteStudent);


// ======================================================
// BOOKING MANAGEMENT ROUTES
// OWNER + WARDEN
// ======================================================

// GET ALL BOOKINGS
router.get("/bookings", protectedMiddleware, getAllBookings);


// APPROVE BOOKING
router.put("/approve/:id", protectedMiddleware, approveStudent);


// REJECT BOOKING
router.put("/reject/:id", protectedMiddleware, rejectStudent);


// ======================================================
// STUDENT PROFILE ROUTE
// JWT PROTECTED
// ======================================================

// UPDATE PROFILE
router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

// GET CURRENT STUDENT PROFILE
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

// ======================================================
// GET BOOKING STATUS
// JWT PROTECTED
// ======================================================

router.get(

  "/booking-status",
  authMiddleware,
  getBookingStatus
);


module.exports = router;