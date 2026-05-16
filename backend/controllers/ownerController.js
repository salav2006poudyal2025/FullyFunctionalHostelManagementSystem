const User = require("../models/User");
const bcrypt = require("bcryptjs");

// POST /api/owner/wardens
exports.createWarden = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email and password are required" });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const warden = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      password: hashed,
      role: "Warden",
    });

    res.status(201).json({
      _id: warden._id,
      fullName: warden.fullName,
      email: warden.email,
      phone: warden.phone,
      role: warden.role,
      createdAt: warden.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/owner/wardens
exports.getWardens = async (req, res) => {
  try {
    const wardens = await User.find({ role: "Warden" }).select("-password").sort({ createdAt: -1 });
    res.json(wardens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/owner/wardens/:id
exports.updateWarden = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const warden = await User.findOne({ _id: req.params.id, role: "Warden" });

    if (!warden) return res.status(404).json({ message: "Warden not found" });

    if (fullName) warden.fullName = fullName;
    if (email) warden.email = email.toLowerCase();
    if (phone !== undefined) warden.phone = phone;
    if (password) {
      if (password.trim().length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      warden.password = await bcrypt.hash(password, 10);
    }

    await warden.save();

    res.json({
      _id: warden._id,
      fullName: warden.fullName,
      email: warden.email,
      phone: warden.phone,
      role: warden.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/owner/wardens/:id
exports.deleteWarden = async (req, res) => {
  try {
    const warden = await User.findOne({ _id: req.params.id, role: "Warden" });
    if (!warden) return res.status(404).json({ message: "Warden not found" });

    await warden.deleteOne();
    res.json({ message: "Warden deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
