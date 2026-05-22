require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/User");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  })
);

async function seedDefaultOwner() {
  const email = "owner@gmail.com";
  const password = "owner12345";
  const hashed = await bcrypt.hash(password, 10);
  const owner = await User.findOne({ email });

  if (!owner) {
    await User.create({
      fullName: "System Owner",
      email,
      password: hashed,
      role: "Owner",
    });
    console.log("Default owner created: owner@gmail.com / owner12345");
    return;
  }

  const passwordMatches = await bcrypt.compare(password, owner.password);
  let changed = false;

  if (!passwordMatches) {
    owner.password = hashed;
    changed = true;
  }

  if (owner.role !== "Owner") {
    owner.role = "Owner";
    changed = true;
  }

  if (!owner.fullName) {
    owner.fullName = "System Owner";
    changed = true;
  }

  if (changed) {
    await owner.save();
    console.log("Default owner account repaired: owner@gmail.com / owner12345");
  }
}

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/owner", require("./routes/ownerRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

app.get("/", (req, res) =>
  res.json({ message: "Hostel Management API running" })
);

async function startServer() {
  await connectDB();
  await seedDefaultOwner();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer().catch((err) => {
  console.error("Server startup error:", err.message);
  process.exit(1);
});
