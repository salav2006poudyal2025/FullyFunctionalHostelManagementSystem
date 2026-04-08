const express = require("express");
const router = express.Router();

const {
  addStudent,
  approveStudent
} = require("../controllers/studentController");

router.post("/add", addStudent);
router.put("/approve/:id", approveStudent);

module.exports = router;