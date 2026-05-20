const express = require("express");

const router = express.Router();

const {
  login,
  registerStudent,
  studentLogin
} = require("../controllers/authController");

// OWNER/WARDEN LOGIN
router.post("/login", login);

// STUDENT REGISTER
router.post("/student/register", registerStudent);

// STUDENT LOGIN
router.post("/student/login", studentLogin);

module.exports = router;