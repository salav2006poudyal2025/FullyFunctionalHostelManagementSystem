require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/User");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// Seed default Owner account on startup
(async () => {
  try {
    const exists = await User.findOne({ email: "owner@gmail.com" });
    if (!exists) {
      const hashed = await bcrypt.hash("owner12345", 10);
      await User.create({
        fullName: "System Owner",
        email: "owner@gmail.com",
        password: hashed,
        role: "Owner",
      });
      console.log("✅ Default Owner created — email: owner@gmail.com | password: owner12345");
    }
  } catch (err) {
    console.error("Seed error:", err.message);
  }
})();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/owner", require("./routes/ownerRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

// Health check
app.get("/", (req, res) => res.json({ message: "Hostel Management API running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
