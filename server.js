const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Backend running...");
});

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});