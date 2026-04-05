const express = require("express");
const router = express.Router();

const {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  approveStudent,
  rejectStudent,
  getAllBookings
} = require("../controllers/studentController");

router.get("/", getStudents);
router.post("/", addStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.post("/approve/:id", approveStudent);
router.get("/bookings", getAllBookings);
router.put("/approve/:id", approveStudent);
router.put("/reject/:id", rejectStudent);

module.exports = router;