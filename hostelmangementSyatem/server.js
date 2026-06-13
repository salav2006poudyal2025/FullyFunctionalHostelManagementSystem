const seedOwner = require("./config/seedOwner");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const wardenRoutes = require("./routes/wardenRoutes");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/wardens", wardenRoutes);
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));


app.get("/", (req, res) => {
  res.send("Server is running...");
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  seedOwner(); // Call seedOwner after server starts
});