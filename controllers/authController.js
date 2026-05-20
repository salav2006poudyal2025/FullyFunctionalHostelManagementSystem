const Student = require("../models/Student");
const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ======================================================
// PASSWORD VALIDATION HELPER
// ======================================================

const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return false;
  }
  
  const trimmedPassword = password.trim();
  const MIN_PASSWORD_LENGTH = 8;
  
  return trimmedPassword.length >= MIN_PASSWORD_LENGTH;
};


// ======================================================
// OWNER / WARDEN LOGIN
// ======================================================

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    // CHECK REQUIRED FIELDS
    if (!email || !password) {

      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // VALIDATE PASSWORD
    if (!validatePassword(password)) {

      return res.status(400).json({
        message: "Invalid password format"
      });
    }

    // FIND USER
    const user = await User.findOne({ email });

    // INVALID USER
    if (!user) {

      return res.status(401).json({
        message: "Incorrect email or password"
      });
    }

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    // INVALID PASSWORD
    if (!isMatch) {

      return res.status(401).json({
        message: "Incorrect email or password"
      });
    }

    // GENERATE JWT TOKEN
    const token = jwt.sign(

      {
        id: user._id,
        role: user.role
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "24h"
      }
    );

    // SUCCESS RESPONSE
    res.status(200).json({

      message: "Login successful",

      token,

      role: user.role,

      userId: user._id
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};


// ======================================================
// STUDENT REGISTER
// ======================================================

exports.registerStudent = async (req, res) => {

  try {

    const {
      fullName,
      email,
      phone,
      password
    } = req.body;

    // CHECK REQUIRED FIELDS
    if (!fullName || !email || !phone || !password) {

      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // VALIDATE PASSWORD
    if (!validatePassword(password)) {

      return res.status(400).json({
        message: "Password must be at least 8 characters long (excluding leading/trailing spaces)"
      });
    }

    // CHECK DUPLICATE EMAIL
    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {

      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE NEW STUDENT
    const student = new Student({

      fullName,
      email,
      phone,
      password: hashedPassword

    });

    // SAVE TO DATABASE
    await student.save();

    // SUCCESS RESPONSE
    res.status(201).json({

      message: "Student registered successfully",

      studentId: student._id
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};


// ======================================================
// STUDENT LOGIN
// ======================================================

exports.studentLogin = async (req, res) => {

  try {

    const {
      email,
      phone,
      password
    } = req.body;

    // CHECK REQUIRED INPUT
    if ((!email && !phone) || !password) {

      return res.status(400).json({
        message: "Email or phone and password are required"
      });
    }

    // VALIDATE PASSWORD
    if (!validatePassword(password)) {

      return res.status(400).json({
        message: "Invalid password format"
      });
    }

    // FIND STUDENT
    let student;

    if (email) {

      student = await Student.findOne({ email });

    } else if (phone) {

      student = await Student.findOne({ phone });
    }

    // INVALID USER
    if (!student) {

      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(
      password,
      student.password
    );

    // INVALID PASSWORD
    if (!isMatch) {

      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // GENERATE JWT TOKEN
    const token = jwt.sign(

      {
        id: student._id,
        role: "Student"
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "24h"
      }
    );

    // SUCCESS RESPONSE
    res.status(200).json({

      token,

      role: "Student",

      studentId: student._id
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
};