const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();


// ======================================================
// CREATE EXPRESS APPLICATION
// ======================================================

const app = express();


// ======================================================
// IMPORT ROUTES
// ======================================================

// AUTH ROUTES
const authRoutes = require(
  "./routes/authRoutes"
);

// STUDENT ROUTES
const studentRoutes = require(
  "./routes/studentRoutes"
);

// PAYMENT ROUTES
const paymentRoutes = require(
  "./routes/paymentRoutes"
);

// OWNER ROUTES
const ownerRoutes = require(
  "./routes/ownerRoutes"
);

// WARDEN ROUTES
const wardenRoutes = require(
  "./routes/wardenRoutes"
);


// ======================================================
// IMPORT CONFIG FILES
// ======================================================

// DEFAULT OWNER ACCOUNT SEED
const seedOwner = require(
  "./config/seedOwner"
);


// ======================================================
// GLOBAL MIDDLEWARE
// ======================================================

// ENABLE JSON REQUEST BODY
app.use(express.json());

// ENABLE CORS
app.use(cors());

// STATIC FOLDER FOR IMAGE ACCESS
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);


// ======================================================
// SEED DEFAULT OWNER ACCOUNT
// ======================================================

seedOwner();


// ======================================================
// API ROUTES
// ======================================================

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.use(
  "/api/auth",
  authRoutes
);


// ==========================================
// STUDENT MANAGEMENT ROUTES
// ==========================================

app.use(
  "/api/students",
  studentRoutes
);


// ==========================================
// STUDENT PAYMENT ROUTES
// ==========================================

app.use(
  "/api/student",
  paymentRoutes
);


// ==========================================
// OWNER SETTINGS ROUTES
// ==========================================

app.use(
  "/api/owner",
  ownerRoutes
);


// ==========================================
// WARDEN MANAGEMENT ROUTES
// ==========================================

app.use(
  "/api/wardens",
  wardenRoutes
);


// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {

  res.status(200).json({

    success: true,

    message:
      "Hostel Management Backend Running Successfully"
  });
});


// ======================================================
// DATABASE CONNECTION
// ======================================================

mongoose.connect(process.env.MONGO_URI)

  .then(() => {

    console.log(
      "MongoDB Connected Successfully"
    );
  })

  .catch((error) => {

    console.log(
      "MongoDB Connection Error:",
      error
    );
  });


// ======================================================
// HANDLE INVALID ROUTES
// ======================================================

app.use((req, res) => {

  res.status(404).json({

    success: false,

    message: "Route not found"
  });
});


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((error, req, res, next) => {

  res.status(500).json({

    success: false,

    message: error.message
  });
});


// ======================================================
// SERVER PORT
// ======================================================

const PORT = process.env.PORT || 5000;


// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );
});