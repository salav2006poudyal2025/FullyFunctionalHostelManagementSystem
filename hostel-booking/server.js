// server.js
// ─────────────────────────────────────────────────────────────────────────────
// This is the ENTRY POINT of our hostel booking system.
// Run it with: node server.js
// Then open: http://localhost:3000/booking
// ─────────────────────────────────────────────────────────────────────────────

// Step 1: Import the packages we need
import express from "express";     // Express helps us build a web server easily
import session from "express-session";
import mongoose from "mongoose";

// Step 2: Import our booking routes (the URL handlers)
import bookingRoutes from "./routes/booking.js";

// Step 3: Create the Express app
const app  = express();
const PORT = 3000; // The port our server will listen on

// Hardcoded users for demo (in production, use database)
const users = {
  warden: { username: "warden", password: "warden123", role: "warden" },
  owner: { username: "owner", password: "owner123", role: "owner" }
};

// Serve static files from project root (for JS/CSS/dashboard HTML)
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(__dirname));

// Session middleware
app.use(session({
  secret: "hostel-booking-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Prevent caching for authenticated pages
app.use((req, res, next) => {
  if (req.session.user) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  }
  next();
});
// ─── Middleware ───────────────────────────────────────────────────────────────
// Middleware = code that runs on EVERY request before it reaches our routes.

// This allows Express to read data submitted from HTML forms (POST requests)
app.use(express.urlencoded({ extended: false }));

// This allows Express to read JSON data (useful for API calls)
app.use(express.json());

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function requireAuth(role = null) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    if (role && req.session.user.role !== role && req.session.user.role !== "owner") {
      return res.redirect("/" + req.session.user.role + "-dashboard");
    }
    next();
  };
}

function requireNoAuth(req, res, next) {
  if (req.session.user) {
    return res.redirect("/" + req.session.user.role + "-dashboard");
  }
  next();
}

// ─── Routes ──────────────────────────────────────────────────────────────────
// Login page
app.get("/login", requireNoAuth, (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

// Login POST
app.post("/login", requireNoAuth, (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  if (user && user.password === password) {
    req.session.user = { username: user.username, role: user.role };
    res.redirect("/" + user.role + "-dashboard");
  } else {
    res.redirect("/login?error=1");
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out");
    }
    res.redirect("/");
  });
});

// Protected routes
app.get("/warden-dashboard", requireAuth("warden"), (req, res) => {
  res.redirect("/booking/warden");
});

app.get("/owner-dashboard", requireAuth("owner"), (req, res) => {
  res.redirect("/booking/admin");
});

// Tell Express: "For any URL starting with /booking, use bookingRoutes"
app.use("/booking", bookingRoutes);

// Home page — redirect based on auth
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/" + req.session.user.role + "-dashboard");
  } else {
    res.redirect("/booking");
  }
});

// ─── Start the server ─────────────────────────────────────────────────────────
// Connect to MongoDB and start server
async function startServer() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hostel-booking');
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log("─────────────────────────────────────────");
      console.log(`  Hostel Booking System is running!`);
      console.log(`  Student Booking: http://localhost:${PORT}/booking`);
      console.log(`  Login: http://localhost:${PORT}/login`);
      console.log(`  Warden: warden/warden123`);
      console.log(`  Owner: owner/owner123`);
      console.log("─────────────────────────────────────────");
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

startServer();
