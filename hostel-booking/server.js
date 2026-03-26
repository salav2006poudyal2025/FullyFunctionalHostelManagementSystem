// server.js
// ─────────────────────────────────────────────────────────────────────────────
// This is the ENTRY POINT of our hostel booking system.
// Run it with: node server.js
// Then open: http://localhost:3000/booking
// ─────────────────────────────────────────────────────────────────────────────

// Step 1: Import the packages we need
const express = require("express");     // Express helps us build a web server easily

// Step 2: Import our booking routes (the URL handlers)
const bookingRoutes = require("./routes/booking");

// Step 3: Create the Express app
const app  = express();
const PORT = 3000; // The port our server will listen on

// ─── Middleware ───────────────────────────────────────────────────────────────
// Middleware = code that runs on EVERY request before it reaches our routes.

// This allows Express to read data submitted from HTML forms (POST requests)
app.use(express.urlencoded({ extended: false }));

// This allows Express to read JSON data (useful for API calls)
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
// Tell Express: "For any URL starting with /booking, use bookingRoutes"
app.use("/booking", bookingRoutes);

// Home page — just redirect to the booking form
app.get("/", (req, res) => {
  res.redirect("/booking");
});

// ─── Start the server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("─────────────────────────────────────────");
  console.log(`  Hostel Booking System is running!`);
  console.log(`  Open in browser: http://localhost:${PORT}/booking`);
  console.log(`  Admin page:      http://localhost:${PORT}/booking/all`);
  console.log("─────────────────────────────────────────");
});
