const express = require("express");

const router = express.Router();

const {
  getStudentPayments
} = require(
  "../controllers/paymentController"
);

const authMiddleware = require(
  "../middleware/authMiddleware"
);


// ======================================================
// GET STUDENT PAYMENTS
// PROTECTED ROUTE
// ======================================================

router.get(

  "/payments",

  authMiddleware,

  getStudentPayments
);


module.exports = router;